const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

interface UploadResult {
  key: string
  publicUrl: string
}

export function useUpload() {
  const { api } = useApi()
  const uploading = ref(false)
  const progress = ref(0)
  const error = ref<string | null>(null)

  function validateFile(file: File): string | null {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `File type not allowed. Accepted: JPG, PNG, WebP`
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File exceeds 10MB limit`
    }
    return null
  }

  async function uploadFile(file: File, folder: string): Promise<UploadResult> {
    const validationError = validateFile(file)
    if (validationError) {
      throw new Error(validationError)
    }

    error.value = null
    uploading.value = true
    progress.value = 0

    try {
      // Get presigned URL from API
      const presigned = await api<{ uploadUrl: string; key: string; publicUrl: string }>(
        '/upload/presigned-url',
        {
          method: 'POST',
          body: {
            folder,
            filename: file.name,
            contentType: file.type,
          },
        },
      )

      // Upload directly to S3 using XMLHttpRequest for progress tracking
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()

        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            progress.value = Math.round((e.loaded / e.total) * 100)
          }
        })

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve()
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`))
          }
        })

        xhr.addEventListener('error', () => reject(new Error('Upload failed')))
        xhr.addEventListener('abort', () => reject(new Error('Upload cancelled')))

        xhr.open('PUT', presigned.uploadUrl)
        xhr.setRequestHeader('Content-Type', file.type)
        xhr.send(file)
      })

      return { key: presigned.key, publicUrl: presigned.publicUrl }
    } catch (e: any) {
      error.value = e.message || 'Upload failed'
      throw e
    } finally {
      uploading.value = false
    }
  }

  async function uploadFiles(
    files: File[],
    folder: string,
    maxFiles: number = 5,
  ): Promise<UploadResult[]> {
    if (files.length > maxFiles) {
      throw new Error(`Maximum ${maxFiles} files allowed`)
    }

    const results: UploadResult[] = []
    for (const file of files) {
      const result = await uploadFile(file, folder)
      results.push(result)
    }
    return results
  }

  return { uploading, progress, error, uploadFile, uploadFiles, validateFile }
}
