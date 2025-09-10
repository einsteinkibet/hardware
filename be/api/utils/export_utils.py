# api/utils/export_utils.py
import pandas as pd
from io import BytesIO
from django.http import HttpResponse
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
import datetime

def export_to_excel(queryset, filename, fields=None):
    """
    Export a queryset to Excel
    """
    df = pd.DataFrame(list(queryset.values(*fields))) if fields else pd.DataFrame(list(queryset.values()))
    
    output = BytesIO()
    writer = pd.ExcelWriter(output, engine='xlsxwriter')
    df.to_excel(writer, sheet_name='Sheet1', index=False)
    writer.close()
    
    output.seek(0)
    response = HttpResponse(
        output.getvalue(),
        content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    response['Content-Disposition'] = f'attachment; filename="{filename}_{datetime.date.today()}.xlsx"'
    return response

def export_to_pdf(queryset, filename, fields=None, headers=None):
    """
    Export a queryset to PDF
    """
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="{filename}_{datetime.date.today()}.pdf"'
    
    data = list(queryset.values_list(*fields)) if fields else list(queryset.values_list())
    
    # Create the PDF object
    doc = SimpleDocTemplate(response, pagesize=letter)
    elements = []
    
    styles = getSampleStyleSheet()
    title_style = styles['Heading1']
    
    # Add title
    title = Paragraph(f"{filename} Report", title_style)
    elements.append(title)
    
    # Add date
    date_text = Paragraph(f"Generated on: {datetime.date.today()}", styles['Normal'])
    elements.append(date_text)
    
    # Add empty space
    elements.append(Spacer(1, 24))
    
    # Prepare table data
    if headers:
        table_data = [headers]
    else:
        table_data = [[field.verbose_name for field in queryset.model._meta.fields]]
    
    table_data.extend(data)
    
    # Create table
    table = Table(table_data)
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 14),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    
    elements.append(table)
    doc.build(elements)
    
    return response