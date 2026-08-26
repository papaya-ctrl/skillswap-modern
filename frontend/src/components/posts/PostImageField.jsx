import { useEffect, useRef, useState } from 'react'

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024

function PostImageField({
  existingImageUrl = '',
  imageFile,
  removeExistingImage,
  error,
  onImageChange,
  onRemoveExistingImageChange,
}) {
  const inputRef = useRef(null)
  const objectUrlRef = useRef('')
  const [previewUrl, setPreviewUrl] = useState('')
  const visibleImageUrl = imageFile ? previewUrl : existingImageUrl
  const shouldShowImage = visibleImageUrl && !removeExistingImage

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current)
      }
    }
  }, [])

  function replacePreview(file) {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
    }

    const objectUrl = URL.createObjectURL(file)
    objectUrlRef.current = objectUrl
    setPreviewUrl(objectUrl)
  }

  function clearPreview() {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = ''
    }

    setPreviewUrl('')
  }

  function clearInput() {
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      clearPreview()
      onImageChange(null, 'Choose a JPG, PNG, or WebP image.')
      clearInput()
      return
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      clearPreview()
      onImageChange(null, 'Choose an image that is 2 MB or smaller.')
      clearInput()
      return
    }

    onRemoveExistingImageChange(false)
    replacePreview(file)
    onImageChange(file, '')
  }

  function handleRemoveSelectedImage() {
    clearPreview()
    onImageChange(null, '')
    clearInput()
  }

  function handleRemoveExistingImage() {
    clearPreview()
    onImageChange(null, '')
    onRemoveExistingImageChange(true)
    clearInput()
  }

  function handleKeepExistingImage() {
    onRemoveExistingImageChange(false)
  }

  return (
    <div className="field image-field">
      <label htmlFor="image">Post image</label>

      {shouldShowImage ? (
        <div className="image-field__preview">
          <img src={visibleImageUrl} alt="Selected post preview" />
        </div>
      ) : null}

      {removeExistingImage && existingImageUrl ? (
        <p className="image-field__status">Current image will be removed.</p>
      ) : null}

      <div className="image-field__actions">
        <input
          ref={inputRef}
          id="image"
          name="image"
          type="file"
          accept={ACCEPTED_IMAGE_TYPES.join(',')}
          onChange={handleFileChange}
        />

        {imageFile ? (
          <button type="button" className="button--ghost" onClick={handleRemoveSelectedImage}>
            Remove selected image
          </button>
        ) : null}

        {!imageFile && existingImageUrl && !removeExistingImage ? (
          <button type="button" className="button--ghost" onClick={handleRemoveExistingImage}>
            Remove current image
          </button>
        ) : null}

        {removeExistingImage && existingImageUrl ? (
          <button type="button" className="button--ghost" onClick={handleKeepExistingImage}>
            Keep current image
          </button>
        ) : null}
      </div>

      {error ? <p className="field__error">{error}</p> : null}
    </div>
  )
}

export default PostImageField
