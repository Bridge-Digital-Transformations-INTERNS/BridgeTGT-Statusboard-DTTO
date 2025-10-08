import { ref } from 'vue';
import { useToastNotification } from "@/composables/useToastNotification";


/**
 * Composable for handling image upload with validation and compression
 * @param {Object} options - Configuration options
 * @param {number} options.maxWidth - Maximum width for compressed image (default: 400)
 * @param {number} options.maxHeight - Maximum height for compressed image (default: 400)
 * @param {number} options.quality - JPEG compression quality 0-1 (default: 0.8)
 * @param {number} options.maxFileSizeMB - Maximum file size in MB before compression (default: 5)
 * @param {number} options.maxCompressedSizeKB - Maximum compressed size in KB (default: 500)
 * @param {Array<string>} options.allowedTypes - Allowed MIME types
 * @param {Array<string>} options.allowedExtensions - Allowed file extensions
 */
export function useImageUpload(options = {}) {
  const {
    maxWidth = 400,
    maxHeight = 400,
    quality = 0.8,
    maxFileSizeMB = 5,
    maxCompressedSizeKB = 500,
    allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp']
  } = options;

  const { showError } = useToastNotification();
  const fileInput = ref(null);
  const imageUrl = ref(null);
  const error = ref('');
  const isProcessing = ref(false);

  /**
   * Show validation error toast
   */
  function showValidationError(message) {
    showError('Validation Error', message);
  }

  /**
   * Validate file type and extension
   */
  function validateFile(file) {
    const fileName = file.name.toLowerCase();
    const fileExtension = fileName.substring(fileName.lastIndexOf('.'));

    // Check MIME type and extension
    if (!allowedTypes.includes(file.type.toLowerCase()) || !allowedExtensions.includes(fileExtension)) {
      error.value = `Invalid format: ${file.name}`;
      showValidationError(`Please upload only ${allowedExtensions.join(', ').toUpperCase()} images`);
      return false;
    }

    // Check file size
    const maxSizeBytes = maxFileSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      error.value = `Image size should be less than ${maxFileSizeMB}MB`;
      showValidationError(`Image size should be less than ${maxFileSizeMB}MB`);
      return false;
    }

    return true;
  }

  /**
   * Compress and convert image to base64
   */
  function compressImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const img = new Image();

        img.onload = () => {
          try {
            // Create canvas for compression
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            let width = img.width;
            let height = img.height;

            // Calculate new dimensions while maintaining aspect ratio
            if (width > height) {
              if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
              }
            } else {
              if (height > maxHeight) {
                width = (width * maxHeight) / height;
                height = maxHeight;
              }
            }

            canvas.width = width;
            canvas.height = height;

            // Draw and compress image
            ctx.drawImage(img, 0, 0, width, height);

            // Convert to base64 with compression
            const compressedBase64 = canvas.toDataURL('image/jpeg', quality);

            // Check if compressed size is still too large
            const maxCompressedSize = maxCompressedSizeKB * 1000;
            if (compressedBase64.length > maxCompressedSize) {
              error.value = 'Image is too large even after compression. Please use a smaller image.';
              showValidationError('Image is too large. Please use a smaller image.');
              reject(new Error('Compressed image too large'));
              return;
            }

            resolve(compressedBase64);
          } catch (err) {
            error.value = 'Failed to process the image file';
            showValidationError('Failed to process the image file');
            reject(err);
          }
        };

        img.onerror = () => {
          error.value = 'Failed to process the image file';
          showValidationError('Failed to process the image file');
          reject(new Error('Failed to load image'));
        };

        img.src = e.target.result;
      };

      reader.onerror = () => {
        error.value = 'Failed to read the image file';
        showValidationError('Failed to read the image file');
        reject(new Error('Failed to read file'));
      };

      reader.readAsDataURL(file);
    });
  }

  /**
   * Handle file upload event
   */
  async function handleUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Clear previous error
    error.value = '';
    isProcessing.value = true;

    try {
      // Validate file
      if (!validateFile(file)) {
        clearFileInput();
        isProcessing.value = false;
        return;
      }

      // Compress and convert to base64
      const compressedBase64 = await compressImage(file);
      imageUrl.value = compressedBase64;
      error.value = '';
    } catch (err) {
      clearFileInput();
      console.error('Image upload error:', err);
    } finally {
      isProcessing.value = false;
    }
  }

  /**
   * Remove uploaded image
   */
  function removeImage() {
    imageUrl.value = null;
    error.value = '';
    clearFileInput();
  }

  /**
   * Clear file input
   */
  function clearFileInput() {
    if (fileInput.value) {
      fileInput.value.value = '';
    }
  }

  /**
   * Reset all state
   */
  function reset() {
    imageUrl.value = null;
    error.value = '';
    isProcessing.value = false;
    clearFileInput();
  }

  /**
   * Set image URL directly (for editing)
   */
  function setImageUrl(url) {
    imageUrl.value = url;
    error.value = '';
  }

  return {
    fileInput,
    imageUrl,
    error,
    isProcessing,
    handleUpload,
    removeImage,
    reset,
    setImageUrl,
    clearFileInput
  };
}
