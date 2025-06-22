import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface UploadedAudio {
  id: number;
  name: string;
  url: string;
  folder: string;
}

@Component({
  selector: 'app-audio-uploader',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './audio-uploader.component.html',
  styleUrls: ['./audio-uploader.component.css'],
})
export class AudioUploaderComponent implements OnInit {
  selectedFile: File | null = null;
  uploadedAudios: UploadedAudio[] = [];
  uploading = false;
  uploadProgress: number = 0;
  uploadMessage: string = '';
  isDragging: boolean = false;
  private nextAudioId = 0;

  // Array de carpetas predefinidas
  availableFolders: string[] = [

    'idiomas-app/ingles/pruebas',
    'idiomas-app/ingles/basico',
    'idiomas-app/ingles/intermedio',
    'idiomas-app/otro/avanzado' // Puedes añadir más carpetas aquí
  ];

  // Propiedad para la carpeta seleccionada en el <select>
  selectedUploadFolder: string = this.availableFolders[0]; // Seleccionar la primera opción por defecto

  // ¡IMPORTANTE! Reemplaza con tus valores reales de Cloudinary
  private CLOUDINARY_CLOUD_NAME = 'dcxto1nnl'; // [!IMPORTANT] Cambia esto
  private CLOUDINARY_UPLOAD_PRESET = 'angular_audio_uploads'; // [!IMPORTANT] Cambia esto al nombre de tu preset sin firmar
  constructor() {}

  ngOnInit() {
    // Si quieres que el valor inicial sea diferente al primero de la lista
    // Por ejemplo, que la carpeta por defecto sea 'idiomas-app/ingles/listening'
    // this.selectedUploadFolder = 'idiomas-app/ingles/listening';
  }

  // Métodos para Drag and Drop
  onDragOver(event: DragEvent) {
    event.preventDefault(); // Necesario para permitir el drop
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false; // Resetear el estado de arrastre
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      if (file.type.startsWith('audio/')) { // Asegurarse de que es un archivo de audio
        this.selectedFile = file;
        this.uploadMessage = `Archivo arrastrado: ${this.selectedFile.name}`;
        this.uploadProgress = 0;
        this.uploadAudio(); // Iniciar la subida automáticamente
      } else {
        this.uploadMessage = 'Por favor, suelta un archivo de audio válido.';
      }
    }
  }

  // Este método ya no es la forma principal de selección, pero lo mantenemos por si acaso
  // para la opción de "Explorar archivos". También iniciará la subida.
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (file.type.startsWith('audio/')) {
        this.selectedFile = file;
        this.uploadMessage = `Archivo seleccionado: ${this.selectedFile.name}`;
        this.uploadProgress = 0;
        this.uploadAudio(); // Iniciar la subida automáticamente
      } else {
        this.uploadMessage = 'Por favor, selecciona un archivo de audio válido.';
      }
      input.value = ''; // Limpiar el input para permitir seleccionar el mismo archivo de nuevo
    } else {
      this.selectedFile = null;
      this.uploadMessage = 'Ningún archivo seleccionado.';
      this.uploadProgress = 0;
    }
  }

  async uploadAudio() {
    if (!this.selectedFile || this.uploading) { // Evitar subidas duplicadas
      return;
    }

    this.uploading = true;
    this.uploadProgress = 0;
    const targetFolderDisplay = this.selectedUploadFolder ? this.selectedUploadFolder : 'raíz';
    this.uploadMessage = `Subiendo "${this.selectedFile.name}" a la carpeta "${targetFolderDisplay}"...`;

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('upload_preset', this.CLOUDINARY_UPLOAD_PRESET);

    // Añade la carpeta seleccionada del <select> al FormData
    if (this.selectedUploadFolder) {
      formData.append('folder', this.selectedUploadFolder.trim());
    }

    const cloudinaryUploadUrl = `https://api.cloudinary.com/v1_1/${this.CLOUDINARY_CLOUD_NAME}/upload`;

    try {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', cloudinaryUploadUrl);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          this.uploadProgress = Math.round((event.loaded / event.total) * 100);
        }
      };

      xhr.onload = () => {
        this.uploading = false;
        if (xhr.status >= 200 && xhr.status < 300) {
          const data = JSON.parse(xhr.responseText);
          const newAudio: UploadedAudio = {
            id: this.nextAudioId++, // Asignar un ID único
            name: this.selectedFile?.name || 'Archivo sin nombre',
            url: data.secure_url,
            folder: this.selectedUploadFolder.trim() || 'raíz', // Guardar la carpeta seleccionada
          };
          this.uploadedAudios.push(newAudio); // Agrega la nueva URL al array
          this.selectedFile = null; // Limpiar el archivo seleccionado después de subir
          this.uploadMessage = `"${newAudio.name}" subido con éxito a "${newAudio.folder}". URL añadida a la lista.`;
          console.log('Audio subido con éxito:', newAudio.url, 'en carpeta:', newAudio.folder);
        } else {
          const errorData = JSON.parse(xhr.responseText);
          this.uploadMessage = `Error al subir el audio: ${errorData.error ? errorData.error.message : 'Error desconocido'}`;
          console.error('Error al subir el audio:', errorData);
        }
      };

      xhr.onerror = () => {
        this.uploading = false;
        this.uploadMessage = 'Error de red o CORS al intentar subir el audio.';
        console.error('Error de red o CORS.');
      };

      xhr.send(formData);

    } catch (error) {
      this.uploading = false;
      this.uploadMessage = 'Ha ocurrido un error inesperado durante la subida.';
      console.error('Error inesperado:', error);
    }
  }

  copyUrlToClipboard(url: string) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        this.uploadMessage = '¡URL individual copiada al portapapeles!';
        setTimeout(() => {
          this.uploadMessage = '';
        }, 3000);
      }).catch(err => {
        console.error('No se pudo copiar el texto: ', err);
        this.uploadMessage = 'No se pudo copiar la URL automáticamente.';
      });
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        this.uploadMessage = '¡URL individual copiada al portapapeles! (Método fallback)';
        setTimeout(() => {
          this.uploadMessage = '';
        }, 3000);
      } catch (err) {
        console.error('Fallback: No se pudo copiar el texto: ', err);
        this.uploadMessage = 'No se pudo copiar la URL automáticamente. Por favor, cópiala manualmente.';
      }
      document.body.removeChild(textArea);
    }
  }

  copyAllUrlsToClipboard() {
    if (this.uploadedAudios.length === 0) {
      this.uploadMessage = 'No hay URLs para copiar.';
      return;
    }

    const allUrls = this.uploadedAudios.map(audio => audio.url).join('\n');

    if (navigator.clipboard) {
      navigator.clipboard.writeText(allUrls).then(() => {
        this.uploadMessage = '¡Todas las URLs copiadas al portapapeles!';
        setTimeout(() => {
          this.uploadMessage = '';
        }, 3000);
      }).catch(err => {
        console.error('No se pudieron copiar las URLs: ', err);
        this.uploadMessage = 'No se pudieron copiar todas las URLs automáticamente.';
      });
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = allUrls;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        this.uploadMessage = '¡Todas las URLs copiadas al portapapeles! (Método fallback)';
        setTimeout(() => {
          this.uploadMessage = '';
        }, 3000);
      } catch (err) {
        console.error('Fallback: No se pudieron copiar las URLs: ', err);
        this.uploadMessage = 'No se pudieron copiar todas las URLs automáticamente. Por favor, cópialas manualmente.';
      }
      document.body.removeChild(textArea);
    }
  }

  deleteAudioUrl(id: number) {
    this.uploadedAudios = this.uploadedAudios.filter(audio => audio.id !== id);
    this.uploadMessage = 'URL eliminada de la lista.';
    setTimeout(() => {
      this.uploadMessage = '';
    }, 2000);
  }
}