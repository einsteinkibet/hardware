# utils/pdf_utils.py
from io import BytesIO
from django.http import HttpResponse
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.units import inch
from reportlab.lib import colors

def generate_receipt_pdf(receipt_data):
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=72, leftMargin=72, topMargin=72, bottomMargin=18)
    
    styles = getSampleStyleSheet()
    story = []
    
    # Title
    story.append(Paragraph("RECEIPT", styles['Title']))
    story.append(Spacer(1, 12))
    
    # Company info
    company_info = [
        Paragraph("HardwareHub Store", styles['Normal']),
        Paragraph("123 Tool Street", styles['Normal']),
        Paragraph("Hardware City, HC 12345", styles['Normal']),
        Paragraph("Phone: (555) 123-4567", styles['Normal']),
    ]
    
    story.extend(company_info)
    story.append(Spacer(1, 24))
    
    # Receipt details
    details_data = [
        ["Receipt Number:", receipt_data['order_number']],
        ["Date:", receipt_data['date'].strftime("%Y-%m-%d %H:%M")],
        ["Customer:", receipt_data['customer']],
    ]
    
    details_table = Table(details_data, colWidths=[1.5*inch, 3*inch])
    details_table.setStyle(TableStyle([
        ('FONT', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    
    story.append(details_table)
    story.append(Spacer(1, 24))
    
    # Items table
    items_data = [["Product", "Qty", "Price", "Total"]]
    
    for item in receipt_data['items']:
        items_data.append([
            item['product'],
            str(item['quantity']),
            f"${item['price']}",
            f"${item['subtotal']}"
        ])
    
    items_table = Table(items_data, colWidths=[3*inch, 0.8*inch, 1.2*inch, 1.2*inch])
    items_table.setStyle(TableStyle([
        ('FONT', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('ALIGN', (1, 0), (-1, -1), 'RIGHT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    
    story.append(items_table)
    story.append(Spacer(1, 24))
    
    # Summary
    summary_data = [
        ["Subtotal:", f"${receipt_data['subtotal']}"],
        ["Tax:", f"${receipt_data['tax']}"],
        ["Discount:", f"-${receipt_data['discount']}"],
        ["Total:", f"${receipt_data['total']}"],
        ["Amount Paid:", f"${receipt_data['amount_paid']}"],
        ["Amount Due:", f"${receipt_data['amount_due']}"],
    ]
    
    summary_table = Table(summary_data, colWidths=[1.5*inch, 1.5*inch])
    summary_table.setStyle(TableStyle([
        ('FONT', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('ALIGN', (0, 0), (-1, -1), 'RIGHT'),
        ('FONTNAME', (0, 3), (1, 3), 'Helvetica-Bold'),
        ('FONTNAME', (0, 5), (1, 5), 'Helvetica-Bold'),
        ('LINEABOVE', (0, 3), (-1, 3), 1, colors.black),
        ('LINEABOVE', (0, 5), (-1, 5), 1, colors.black),
    ]))
    
    story.append(summary_table)
    story.append(Spacer(1, 36))
    
    # Thank you message
    story.append(Paragraph("Thank you for your business!", styles['Normal']))
    story.append(Spacer(1, 12))
    story.append(Paragraph("Returns accepted within 30 days with original receipt.", styles['Italic']))
    
    doc.build(story)
    buffer.seek(0)
    return buffer

# Update the generate_receipt view
@login_required
@permission_required('inventory.view_order', raise_exception=True)
def generate_receipt(request, pk):
    order = get_object_or_404(Order, pk=pk)
    receipt_data = order.generate_receipt()
    
    format_type = request.GET.get('format', 'html')
    
    if format_type == 'pdf':
        buffer = generate_receipt_pdf(receipt_data)
        response = HttpResponse(buffer, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="receipt_{order.order_number}.pdf"'
        return response
    else:
        # HTML version
        return render(request, 'orders/receipt.html', {'receipt': receipt_data})