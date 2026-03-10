import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import QRCode from 'qrcode'
import crypto from 'crypto'

export const runtime = 'nodejs'

function romanPlace(place: number) {
  return place === 1 ? 'I' : place === 2 ? 'II' : place === 3 ? 'III' : String(place)
}

function makeNumber(prefix: string, id: string, place?: number | null) {
  const year = new Date().getFullYear()
  const hash = crypto.createHash('sha256').update(id).digest('hex').slice(0, 6).toUpperCase()
  return `${prefix}-${year}-${hash}${place && [1, 2, 3].includes(place) ? `-P${place}` : ''}`
}

export async function GET(_req: Request, { params }: { params: { token: string } }) {
  const admin = createAdminClient()

  const { data: doc, error: docError } = await admin
    .from('contest_documents')
    .select('work_id, access_token, certificate_number, certificate_path, issued_at, award')
    .eq('access_token', params.token)
    .maybeSingle()

  if (docError || !doc) {
    return NextResponse.json({ message: 'Заявка не найдена' }, { status: 404 })
  }

  const { data: work, error } = await admin
    .from('contest_photos')
    .select('id, approved, name, surname_initial, age, city, work_title, contests(title), place, nomination')
    .eq('id', doc.work_id)
    .single()

  if (error || !work) {
    return NextResponse.json({ message: 'Заявка не найдена' }, { status: 404 })
  }

  if (!work.approved) {
    return NextResponse.json({ message: 'Сертификат станет доступен после модерации' }, { status: 403 })
  }

  const place = ((work as any).place ?? null) as number | null
  const isPrize = place !== null && [1, 2, 3].includes(place)
  const contestTitle = (work as any).contests?.title ?? 'Творческий конкурс'
  const fullName = `${work.name} ${work.surname_initial}.`
  const issuedAt = doc.issued_at ? new Date(doc.issued_at) : new Date()
  const certificateNumber = doc.certificate_number || makeNumber('VB', work.id, place)
  const path = isPrize ? `diplomas/${certificateNumber}.pdf` : `certificates/${certificateNumber}.pdf`
  const verifyUrl = `${process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://example.ru'}/verify/${encodeURIComponent(certificateNumber)}`

  if (doc.certificate_path === path) {
    const { data: file, error: downloadError } = await admin.storage.from('certificates').download(path)
    if (!downloadError && file) {
      const buf = Buffer.from(await file.arrayBuffer())
      return new Response(buf, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${isPrize ? 'diploma' : 'certificate'}-${certificateNumber}.pdf"`,
        },
      })
    }
  }

  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([595.28, 841.89])
  const { width, height } = page.getSize()
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  const margin = 36
  page.drawRectangle({ x: margin, y: margin, width: width - margin * 2, height: height - margin * 2, borderColor: rgb(0.12, 0.22, 0.45), borderWidth: 2 })
  page.drawRectangle({ x: margin + 10, y: margin + 10, width: width - (margin + 10) * 2, height: height - (margin + 10) * 2, borderColor: rgb(0.85, 0.88, 0.92), borderWidth: 1 })

  const title = isPrize ? 'ДИПЛОМ ПРИЗЁРА' : 'СЕРТИФИКАТ УЧАСТНИКА'
  const titleWidth = fontBold.widthOfTextAtSize(title, 28)
  page.drawText(title, { x: (width - titleWidth) / 2, y: height - 160, size: 28, font: fontBold, color: rgb(0.12, 0.22, 0.45) })

  const sub = 'настоящим подтверждается, что'
  page.drawText(sub, { x: (width - font.widthOfTextAtSize(sub, 14)) / 2, y: height - 205, size: 14, font, color: rgb(0.35, 0.4, 0.5) })
  page.drawText(fullName, { x: (width - fontBold.widthOfTextAtSize(fullName, 26)) / 2, y: height - 255, size: 26, font: fontBold, color: rgb(0.05, 0.07, 0.1) })

  const body1 = 'принял(а) участие в конкурсе:'
  page.drawText(body1, { x: (width - font.widthOfTextAtSize(body1, 14)) / 2, y: height - 305, size: 14, font, color: rgb(0.35, 0.4, 0.5) })
  page.drawText(contestTitle, { x: (width - fontBold.widthOfTextAtSize(contestTitle, 18)) / 2, y: height - 338, size: 18, font: fontBold, color: rgb(0.12, 0.22, 0.45) })

  if (isPrize && place) {
    const placeLine = `${romanPlace(place)} место`
    page.drawText(placeLine, { x: (width - fontBold.widthOfTextAtSize(placeLine, 20)) / 2, y: height - 370, size: 20, font: fontBold, color: rgb(0.92, 0.44, 0.15) })
    if ((work as any).nomination) {
      const nomination = String((work as any).nomination)
      page.drawText(nomination, { x: (width - font.widthOfTextAtSize(nomination, 12)) / 2, y: height - 402, size: 12, font, color: rgb(0.45, 0.5, 0.6) })
    }
  }

  const meta = `${work.age} лет • ${work.city}${work.work_title ? ` • «${work.work_title}»` : ''}`
  const metaY = isPrize ? height - 430 : height - 372
  page.drawText(meta, { x: (width - font.widthOfTextAtSize(meta, 12)) / 2, y: metaY, size: 12, font, color: rgb(0.45, 0.5, 0.6) })

  try {
    const qrDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 1, width: 220 })
    const qrBytes = Buffer.from(qrDataUrl.split(',')[1], 'base64')
    const qrImage = await pdfDoc.embedPng(qrBytes)
    const qrSize = 88
    page.drawImage(qrImage, { x: width - 28 - qrSize, y: 28, width: qrSize, height: qrSize })
    const label = 'Проверка документа'
    page.drawText(label, { x: width - 28 - qrSize + (qrSize - font.widthOfTextAtSize(label, 9)) / 2, y: 28 + qrSize + 6, size: 9, font, color: rgb(0.45, 0.5, 0.6) })
  } catch {}

  page.drawText(`Номер: ${certificateNumber}`, { x: margin + 24, y: margin + 44, size: 11, font, color: rgb(0.35, 0.4, 0.5) })
  const dateText = `Дата выдачи: ${issuedAt.toLocaleDateString('ru-RU')}`
  page.drawText(dateText, { x: width - margin - 24 - font.widthOfTextAtSize(dateText, 11), y: margin + 44, size: 11, font, color: rgb(0.35, 0.4, 0.5) })
  page.drawText('Организатор', { x: width - margin - 170, y: margin + 120, size: 12, font, color: rgb(0.35, 0.4, 0.5) })
  page.drawLine({ start: { x: width - margin - 220, y: margin + 108 }, end: { x: width - margin - 24, y: margin + 108 }, thickness: 1, color: rgb(0.75, 0.78, 0.82) })

  const pdfBytes = await pdfDoc.save()
  const uploadError = await admin.storage.from('certificates').upload(path, Buffer.from(pdfBytes), { contentType: 'application/pdf', upsert: true })

  await admin.from('contest_documents').upsert({
    work_id: work.id,
    access_token: doc.access_token,
    certificate_number: certificateNumber,
    certificate_path: uploadError.error ? null : path,
    issued_at: issuedAt.toISOString(),
    award: isPrize ? 'prize' : 'participant',
  }, { onConflict: 'work_id' })

  return new Response(Buffer.from(pdfBytes), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${isPrize ? 'diploma' : 'certificate'}-${certificateNumber}.pdf"`,
    },
  })
}
