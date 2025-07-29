import os
import asyncio
from typing import Optional
from dotenv import load_dotenv
from telethon import TelegramClient, events
import requests

load_dotenv()

API_ID = int(os.getenv('API_ID', 0))
API_HASH = os.getenv('API_HASH')
PHONE_NUMBER = os.getenv('PHONE_NUMBER')
SESSION_NAME = os.getenv('SESSION_NAME', 'session')

BOT_USERNAME = 'PirateDiffusion_bot'

async def _download_from_url(url: str, filename: Optional[str] = None) -> str:
    """Download image from URL and return the saved path."""
    filename = filename or os.path.basename(url.split('?')[0]) or 'image.jpg'
    response = requests.get(url, timeout=30)
    response.raise_for_status()
    with open(filename, 'wb') as f:
        f.write(response.content)
    return filename

async def _send_prompt(prompt: str) -> Optional[str]:
    client = TelegramClient(SESSION_NAME, API_ID, API_HASH)
    await client.start(phone=PHONE_NUMBER)
    try:
        await client.send_message(BOT_USERNAME, f'/render {prompt}')
        event = await client.wait_for(events.NewMessage(from_users=BOT_USERNAME), timeout=60)
        message = event.message
        if message.photo:
            path = await client.download_media(message.photo)
            return path
        elif message.text and 'http' in message.text:
            return await _download_from_url(message.text.strip())
        elif message.text:
            return message.text.strip()
        else:
            return None
    except asyncio.TimeoutError:
        return None
    finally:
        await client.disconnect()

def send_prompt(prompt: str) -> Optional[str]:
    """Public wrapper to send prompt synchronously."""
    return asyncio.run(_send_prompt(prompt))
