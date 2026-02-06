import React, { useState, useRef } from 'react';
import './PhotoControl.css';

interface Photo {
  id: string;
  dataUrl: string;
  timestamp: Date;
  type: 'before' | 'after';
}

const PhotoControl: React.FC = () => {
  const [beforePhotos, setBeforePhotos] = useState<Photo[]>([]);
  const [afterPhotos, setAfterPhotos] = useState<Photo[]>([]);
  const [currentPhase, setCurrentPhase] = useState<'before' | 'after'>('before');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
      setIsCameraActive(true);
    } catch (err) {
      console.error('Error accessing camera:', err);
      alert('Nepodařilo se zapnout kameru. Použijte prosím upload souboru.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg');
        addPhoto(dataUrl);
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            addPhoto(e.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const addPhoto = (dataUrl: string) => {
    const newPhoto: Photo = {
      id: Date.now().toString(),
      dataUrl,
      timestamp: new Date(),
      type: currentPhase
    };

    if (currentPhase === 'before') {
      setBeforePhotos([...beforePhotos, newPhoto]);
    } else {
      setAfterPhotos([...afterPhotos, newPhoto]);
    }
  };

  const removePhoto = (id: string, type: 'before' | 'after') => {
    if (type === 'before') {
      setBeforePhotos(beforePhotos.filter(p => p.id !== id));
    } else {
      setAfterPhotos(afterPhotos.filter(p => p.id !== id));
    }
  };

  const canProceed = beforePhotos.length >= 3;
  const canComplete = afterPhotos.length >= 3;

  return (
    <div className="photo-control">
      <h2>Fotokontrola dronu</h2>

      <div className="phase-selector">
        <button
          className={currentPhase === 'before' ? 'active' : ''}
          onClick={() => {
            setCurrentPhase('before');
            stopCamera();
          }}
        >
          Před letem ({beforePhotos.length}/3)
        </button>
        <button
          className={currentPhase === 'after' ? 'active' : ''}
          onClick={() => {
            setCurrentPhase('after');
            stopCamera();
          }}
          disabled={!canProceed}
        >
          Po letu ({afterPhotos.length}/3)
        </button>
      </div>

      <div className="instructions">
        <h3>
          {currentPhase === 'before' 
            ? 'Fotografie před startem' 
            : 'Fotografie po přistání'}
        </h3>
        <p>
          Pořiďte minimálně 3 fotografie dronu z různých úhlů:
        </p>
        <ul>
          <li>Celkový pohled na dron</li>
          <li>Detail rotorů a propelerů</li>
          <li>Detail podvozku a senzorů</li>
        </ul>
      </div>

      <div className="camera-section">
        {!isCameraActive ? (
          <div className="camera-controls">
            <button onClick={startCamera} className="camera-button">
              📷 Zapnout kameru
            </button>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="upload-button"
            >
              📁 Nahrát ze souboru
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </div>
        ) : (
          <div className="camera-view">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline
              className="video-preview"
            />
            <div className="camera-actions">
              <button onClick={capturePhoto} className="capture-button">
                📸 Vyfotit
              </button>
              <button onClick={stopCamera} className="stop-camera-button">
                ✕ Zavřít kameru
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="photos-grid">
        <h3>
          {currentPhase === 'before' 
            ? `Fotografie před letem (${beforePhotos.length})` 
            : `Fotografie po letu (${afterPhotos.length})`}
        </h3>
        <div className="grid">
          {(currentPhase === 'before' ? beforePhotos : afterPhotos).map(photo => (
            <div key={photo.id} className="photo-item">
              <img src={photo.dataUrl} alt={`Foto ${photo.id}`} />
              <button 
                onClick={() => removePhoto(photo.id, photo.type)}
                className="delete-button"
              >
                ✕
              </button>
              <div className="photo-timestamp">
                {photo.timestamp.toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="progress-section">
        {currentPhase === 'before' && !canProceed && (
          <div className="warning">
            ⚠ Potřebujete minimálně 3 fotografie před pokračováním
          </div>
        )}
        {currentPhase === 'before' && canProceed && (
          <button 
            onClick={() => setCurrentPhase('after')}
            className="proceed-button"
          >
            Pokračovat k letu ✓
          </button>
        )}
        {currentPhase === 'after' && !canComplete && (
          <div className="warning">
            ⚠ Potřebujete minimálně 3 fotografie pro dokončení
          </div>
        )}
        {currentPhase === 'after' && canComplete && (
          <div className="success">
            ✓ Kontrola dokončena. Dron byl vrácen v dobrém stavu.
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoControl;
