import React, { useState, useCallback } from 'react';
import { useProposalStore } from '@/lib/stores/useProposalStore';
import Cropper from 'react-easy-crop';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Image as ImageIcon, Crop, RotateCcw, RotateCw, FlipHorizontal, FlipVertical, RefreshCcw, Save, Trash2, Settings2 } from 'lucide-react';

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

function getRadianAngle(degreeValue: number) {
  return (degreeValue * Math.PI) / 180;
}

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number, y: number, width: number, height: number },
  rotation = 0,
  flip = { horizontal: false, vertical: false }
): Promise<string | null> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) return null;

  const rotRad = getRadianAngle(rotation);
  const bBoxWidth = Math.abs(Math.cos(rotRad) * image.width) + Math.abs(Math.sin(rotRad) * image.height);
  const bBoxHeight = Math.abs(Math.sin(rotRad) * image.width) + Math.abs(Math.cos(rotRad) * image.height);

  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
  ctx.translate(-image.width / 2, -image.height / 2);

  ctx.drawImage(image, 0, 0);

  if (!pixelCrop || pixelCrop.width === 0 || pixelCrop.height === 0) {
    return null;
  }

  const data = ctx.getImageData(pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height);

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  ctx.putImageData(data, 0, 0);

  return canvas.toDataURL('image/png');
}

export default function LogoSettingsEditor() {
  const store = useProposalStore();
  const settings = store.logoSettings;
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleApplyCrop = async () => {
    if (croppedAreaPixels && store.clientLogo) {
      try {
        const croppedImage = await getCroppedImg(
          store.clientLogo,
          croppedAreaPixels,
          rotation,
          { horizontal: settings.flipH, vertical: settings.flipV }
        );
        
        if (croppedImage) {
          useProposalStore.setState({ clientLogo: croppedImage });
          // Reset CSS transforms because they are now baked into the new image
          store.updateLogoSettings({
            crop: { x: 0, y: 0 },
            zoom: 1,
            rotation: 0,
            flipH: false,
            flipV: false,
            width: 100, // percentage
            height: 100
          });
          setCrop({ x: 0, y: 0 });
          setZoom(1);
          setRotation(0);
        }
      } catch (e) {
        console.error("Error cropping image:", e);
      }
    }
    setIsModalOpen(false);
  };

  const handleRotateLeft = () => setRotation((prev) => prev - 90);
  const handleRotateRight = () => setRotation((prev) => prev + 90);
  
  const toggleFlipH = () => store.updateLogoSettings({ flipH: !settings.flipH });
  const toggleFlipV = () => store.updateLogoSettings({ flipV: !settings.flipV });

  const resetAll = () => {
    store.updateLogoSettings({
      crop: { x: 0, y: 0 },
      zoom: 1,
      rotation: 0,
      flipH: false,
      flipV: false,
      shape: 'square',
      width: 100,
      height: 100
    });
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
  };

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        useProposalStore.setState({ clientLogo: reader.result as string });
        resetAll();
      };
      reader.readAsDataURL(file);
    }
  };

  if (!store.clientLogo) {
    return (
      <div className="flex flex-col gap-3">
        <button onClick={() => fileInputRef.current?.click()} className="w-full py-4 border-2 border-dashed border-gray-300 rounded text-sm text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors">
          Upload Logo
        </button>
        <input type="file" ref={fileInputRef} onChange={handleLogoUpload} className="hidden" accept="image/*" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Mini Preview & Basic Actions */}
      <div className="flex gap-3 items-center border border-gray-200 p-3 rounded bg-gray-50">
        <div className="w-16 h-16 border border-gray-300 bg-white rounded overflow-hidden flex-shrink-0 flex items-center justify-center relative">
           <img 
              src={store.clientLogo} 
              alt="Logo Preview" 
              className="w-full h-full object-contain"
           />
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex gap-1 flex-wrap">
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <button className="flex items-center gap-1.5 px-2 py-1 bg-white border border-gray-200 rounded text-xs font-medium text-gray-700 hover:bg-gray-50">
                  <Crop size={12} /> Crop & Rotate
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl bg-white p-0 overflow-hidden">
                <DialogHeader className="p-4 border-b border-gray-200 bg-gray-50">
                  <DialogTitle className="text-sm font-semibold text-gray-800">Advanced Image Editor</DialogTitle>
                </DialogHeader>
                <div className="relative w-full h-[400px] bg-[#333]">
                  <Cropper
                    image={store.clientLogo}
                    crop={crop}
                    zoom={zoom}
                    rotation={rotation}
                    aspect={1}
                    onCropChange={setCrop}
                    onCropComplete={onCropComplete}
                    onZoomChange={setZoom}
                    onRotationChange={setRotation}
                  />
                </div>
                <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                  <div className="flex gap-2">
                    <button onClick={handleRotateLeft} className="p-2 bg-white border border-gray-200 rounded hover:bg-gray-100"><RotateCcw size={16} /></button>
                    <button onClick={handleRotateRight} className="p-2 bg-white border border-gray-200 rounded hover:bg-gray-100"><RotateCw size={16} /></button>
                    <input 
                      type="range" min={1} max={3} step={0.1} 
                      value={zoom} onChange={(e) => setZoom(Number(e.target.value))} 
                      className="w-32 mx-2"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                    <button onClick={handleApplyCrop} className="px-4 py-2 text-sm font-medium text-white bg-black hover:bg-gray-800 rounded flex items-center gap-2">
                      <Save size={14} /> Apply Changes
                    </button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <button onClick={toggleFlipH} className="p-1.5 bg-white border border-gray-200 rounded hover:bg-gray-50" title="Flip Horizontal"><FlipHorizontal size={14} /></button>
            <button onClick={toggleFlipV} className="p-1.5 bg-white border border-gray-200 rounded hover:bg-gray-50" title="Flip Vertical"><FlipVertical size={14} /></button>
            <button onClick={resetAll} className="p-1.5 bg-white border border-gray-200 rounded hover:bg-gray-50" title="Reset All"><RefreshCcw size={14} /></button>
            <button onClick={() => useProposalStore.setState({ clientLogo: null })} className="p-1.5 bg-red-50 border border-red-200 text-red-600 rounded hover:bg-red-100 ml-auto" title="Remove"><Trash2 size={14} /></button>
          </div>
        </div>
      </div>
      
      <input type="file" ref={fileInputRef} onChange={handleLogoUpload} className="hidden" accept="image/*" />

      {/* Shape Options */}
      <div className="grid grid-cols-3 gap-2">
        <button onClick={() => store.updateLogoSettings({ shape: 'square' })} className={`py-1.5 text-xs font-medium border rounded ${settings.shape === 'square' ? 'border-black bg-gray-50' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>Square</button>
        <button onClick={() => store.updateLogoSettings({ shape: 'rounded' })} className={`py-1.5 text-xs font-medium border rounded ${settings.shape === 'rounded' ? 'border-black bg-gray-50' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>Rounded</button>
        <button onClick={() => store.updateLogoSettings({ shape: 'circle' })} className={`py-1.5 text-xs font-medium border rounded ${settings.shape === 'circle' ? 'border-black bg-gray-50' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>Circle</button>
      </div>
      
      {/* Size Control */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-gray-700">Display Size: {settings.padding}x</label>
        <input 
          type="range" min="1" max="10" 
          value={settings.padding} 
          onChange={(e) => store.updateLogoSettings({ padding: Number(e.target.value) })}
          className="w-full"
        />
      </div>

    </div>
  );
}
