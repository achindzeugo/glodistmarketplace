"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, File, X, Check, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface FileUploadProps {
  onFileSelect: (file: File | null) => void
  acceptedTypes?: string
  maxSize?: number // en MB
  currentFile?: string | null
  uploadStatus?: 'idle' | 'uploading' | 'success' | 'error'
  disabled?: boolean
}

export function FileUpload({
  onFileSelect,
  acceptedTypes = "image/*,.pdf",
  maxSize = 5,
  currentFile,
  uploadStatus = 'idle',
  disabled = false
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (disabled) return

    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFileSelection(files[0])
    }
  }

  const handleFileSelection = (file: File) => {
    // Vérifier la taille du fichier
    if (file.size > maxSize * 1024 * 1024) {
      toast({
        title: "Fichier trop volumineux",
        description: `Le fichier ne doit pas dépasser ${maxSize}MB`,
        variant: "destructive",
      })
      return
    }

    // Vérifier le type de fichier
    const acceptedTypesArray = acceptedTypes.split(',').map(type => type.trim())
    const isValidType = acceptedTypesArray.some(type => {
      if (type.startsWith('.')) {
        return file.name.toLowerCase().endsWith(type.toLowerCase())
      }
      return file.type.match(type.replace('*', '.*'))
    })

    if (!isValidType) {
      toast({
        title: "Type de fichier non supporté",
        description: "Veuillez sélectionner une image (JPG, PNG) ou un PDF",
        variant: "destructive",
      })
      return
    }

    setSelectedFile(file)
    onFileSelect(file)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files[0]) {
      handleFileSelection(files[0])
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    onFileSelect(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getStatusIcon = () => {
    switch (uploadStatus) {
      case 'uploading':
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
      case 'success':
        return <Check className="h-4 w-4 text-green-600" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <Upload className="h-4 w-4" />
    }
  }

  const getStatusText = () => {
    switch (uploadStatus) {
      case 'uploading':
        return 'Téléchargement en cours...'
      case 'success':
        return 'Fichier téléchargé avec succès'
      case 'error':
        return 'Erreur lors du téléchargement'
      default:
        return 'Cliquez ou glissez votre fichier ici'
    }
  }

  return (
    <div className="space-y-4">
      <Card
        className={`border-2 border-dashed transition-colors cursor-pointer ${
          dragActive 
            ? 'border-primary bg-primary/5' 
            : uploadStatus === 'success'
            ? 'border-green-500 bg-green-50'
            : uploadStatus === 'error'
            ? 'border-red-500 bg-red-50'
            : 'border-muted-foreground/25 hover:border-primary/50'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          {getStatusIcon()}
          <p className="mt-2 text-sm text-muted-foreground">
            {getStatusText()}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Formats acceptés: JPG, PNG, PDF (max {maxSize}MB)
          </p>
        </CardContent>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes}
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />

      {(selectedFile || currentFile) && (
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <File className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">
                  {selectedFile?.name || 'Document téléchargé'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : 'Fichier existant'}
                </p>
              </div>
            </div>
            {!disabled && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveFile}
                className="text-destructive hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}