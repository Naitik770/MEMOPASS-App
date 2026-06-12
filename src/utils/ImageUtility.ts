import { toPng, toCanvas } from 'html-to-image';

/**
 * Reads a File object and converts it to a compressed/resized Base64 Data URL.
 * Resizes the image to secure performance, keep local storage compact,
 * and prevent cross-origin issues during PDF/Canvas generation.
 */
export function processImageFile(file: File, maxWidth = 800, maxHeight = 1000): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Maintain aspect ratio while sizing down if needed
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get 2D canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Clean high quality JPEG output
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Failed to load image file into Image object'));
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error('FileReader failed to read the file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Capture the Specified Element and save it as a high resolution file.
 * Returns the base64 dataUrl of the image.
 */
export async function downloadTicketElement(elementId: string, filename = 'MemoryTicket.png'): Promise<string | null> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with ID ${elementId} not found`);
    return null;
  }

  try {
    // We use html-to-image which properly supports modern CSS (like oklab in Tailwind CSS v4)
    const dataUrl = await toPng(element, {
      pixelRatio: 3, 
      backgroundColor: 'transparent',
    });

    // Create a physical browser trigger-download link
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return dataUrl;
  } catch (error) {
    console.error('Failed to capture ticket element:', error);
    return null;
  }
}

/**
 * Share the generated Ticket Stub image using the Web Share API.
 * Falls back to dynamic clipboard copy/download link if browser lacks native support.
 */
export async function shareTicketElement(
  elementId: string,
  ticketTitle: string,
  onFeedback: (message: string, isError?: boolean) => void
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    onFeedback('Ticket preview element not found.', true);
    return;
  }

  try {
    const dataUrl = await toPng(element, {
      pixelRatio: 2.5,
      backgroundColor: 'transparent',
    });

    // Convert dataUrl to a real File object for Share API compatibility
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    const file = new File([blob], `${ticketTitle.replace(/\s+/g, '_')}_Ticket.png`, { type: 'image/png' });

    // Check system compatibility
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: `Memory Ticket - ${ticketTitle}`,
        text: `Look at this digital ticket memory from my trip to ${ticketTitle}!`,
      });
      onFeedback('Shared successfully!');
    } else {
      // Fallback 1: Clipboard Copy
      try {
        await navigator.clipboard.writeText(window.location.href);
        onFeedback('Native sharing not supported. App link copied to clipboard and starting download!');
      } catch (clipboardError) {
        onFeedback('Native sharing not supported. Downloading ticket directly...');
      }
      
      // Trigger a direct download as safe second-tier fallback
      const link = document.createElement('a');
      link.download = `${ticketTitle.replace(/\s+/g, '_')}_Ticket.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  } catch (error) {
    console.error('Sharing failed:', error);
    onFeedback('Unable to process ticket sharing. Try downloading instead.', true);
  }
}
