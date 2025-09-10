# utils/sms_utils.py
from twilio.rest import Client
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

def send_sms(to_number, message):
    """
    Send SMS using Twilio
    """
    if not all([settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN, settings.TWILIO_PHONE_NUMBER]):
        logger.warning("Twilio credentials not configured. SMS not sent.")
        return False
    
    try:
        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        
        message = client.messages.create(
            body=message,
            from_=settings.TWILIO_PHONE_NUMBER,
            to=to_number
        )
        
        logger.info(f"SMS sent to {to_number}: {message.sid}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send SMS to {to_number}: {str(e)}")
        return False


