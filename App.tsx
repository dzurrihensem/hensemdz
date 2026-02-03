
import React, { useState } from 'react';
import { 
  PlusCircle, 
  Sparkles, 
  FileText, 
  Calendar, 
  Trophy, 
  Image as ImageIcon,
  PenTool,
  CheckCircle,
  Loader2,
  RotateCcw,
  X
} from 'lucide-react';
import { 
  BidangType, 
  PeringkatType, 
  PencapaianType, 
  KategoriJawatan, 
  ReportData 
} from './types';
import { THEMES } from './constants';
import { generateObjectives, generateSummary } from './services/geminiService';
import SignaturePad from './components/SignaturePad';
import ReportTemplate from './components/ReportTemplate';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const SUB_KATEGORI_OPTIONS: Record<KategoriJawatan, string[]> = {
  [KategoriJawatan.PENGETUA]: ['Pentadbiran'],
  [KategoriJawatan.PENOLONG_KANAN]: ['Pentadbiran'],
  [KategoriJawatan.GKMP]: ['Sains Kemasyarakatan', 'Sains dan Matematik', 'Bahasa'],
  [KategoriJawatan.GURU]: ['Sains', 'Matematik', 'Bahasa Inggeris', 'Bahasa Melayu', 'Pendidikan Jasmani', 'Pendidikan Islam', 'Pendidikan Moral'],
  [KategoriJawatan.JURULATIH]: ['Seni Muzik', 'Seni Visual', 'Seni Teater', 'Seni Tari']
};

const INITIAL_STATE: ReportData = {
  bidang: BidangType.KURIKULUM,
  peringkat: PeringkatType.SEKOLAH,
  tajuk: '',
  lokasi: '',
  anjuran: '',
  isDateRange: false,
  tarikhMula: '',
  tarikhTamat: '',
  masaType: 'range',
  masaMula: '',
  masaTamat: '',
  objektif: '',
  impak: '',
  penglibatan: '',
  pencapaian: PencapaianType.TIDAK_BERKENAAN,
  pencapaianDetail: '',
  namaPenyedia: '',
  kategoriPenyedia: KategoriJawatan.GURU,
  subKategoriPenyedia: SUB_KATEGORI_OPTIONS[KategoriJawatan.GURU][0],
  signature: '',
  images: [],
  tahun: new Date().getFullYear().toString()
};

const App: React.FC = () => {
  const [formData, setFormData] = useState<ReportData>(INITIAL_STATE);
  const [loadingAI, setLoadingAI] = useState<{obj: boolean, impak: boolean}>({obj: false, impak: false});
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  const theme = THEMES[formData.bidang];
  const logoUrl = "https://lh3.googleusercontent.com/d/1tyJ5QLBbqarYBYAzkFmPJ7ZBZ0fYp97u";

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (name === 'kategoriPenyedia') {
      const jawatan = value as KategoriJawatan;
      const options = SUB_KATEGORI_OPTIONS[jawatan];
      setFormData(prev => ({ 
        ...prev, 
        kategoriPenyedia: jawatan,
        subKategoriPenyedia: options[0] || ''
      }));
    } else if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleReset = () => {
    if (window.confirm("Adakah anda pasti untuk mengosongkan semua data?")) {
      setFormData(INITIAL_STATE);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newImages = Array.from(files).slice(0, 4 - formData.images.length);
    newImages.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, reader.result as string].slice(0, 4)
        }));
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const callAIObjectives = async () => {
    if (!formData.tajuk) return alert("Sila isi Tajuk Program dahulu!");
    setLoadingAI(prev => ({ ...prev, obj: true }));
    const result = await generateObjectives(formData.tajuk);
    setFormData(prev => ({ ...prev, objektif: result }));
    setLoadingAI(prev => ({ ...prev, obj: false }));
  };

  const callAISummary = async () => {
    if (!formData.tajuk) return alert("Sila isi Tajuk Program dahulu!");
    setLoadingAI(prev => ({ ...prev, impak: true }));
    const result = await generateSummary(formData.tajuk);
    setFormData(prev => ({ ...prev, impak: result }));
    setLoadingAI(prev => ({ ...prev, impak: false }));
  };

  const generatePDF = async () => {
    if (isGeneratingPDF) return;
    setIsGeneratingPDF(true);
    const element = document.getElementById('report-template-hidden');
    if (!element) {
        setIsGeneratingPDF(false);
        return;
    }
    try {
      await new Promise(r => setTimeout(r, 1000));
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/jpeg', 0.9);
      const pdf = new jsPDF('p', 'mm', 'a4');
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
      pdf.save(`SSEMJ_OPR_${formData.tajuk || 'Laporan'}.pdf`);
    } catch (error) {
      console.error("PDF Error:", error);
      alert("Gagal menjana PDF.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className={`h-3 ${theme.gradient} sticky top-0 z-50 shadow-md`}></div>
      <header className="bg-white shadow-sm border-b px-4 py-8 md:py-10 mb-6 flex flex-col items-center relative overflow-hidden">
        <div className={`absolute inset-0 opacity-5 ${theme.gradient}`}></div>
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="bg-white p-2 rounded-2xl shadow-lg border border-gray-100">
            <img src={logoUrl} alt="SSEMJ" className="h-16 md:h-20 w-auto" />
          </div>
          <div className="text-center">
            <h1 className="text-3xl md:text-5xl font-black text-gray-900 uppercase leading-none">
              SSEMJ <span className={`bg-clip-text text-transparent ${theme.gradient}`}>ONE PAGE REPORT</span>
            </h1>
            <p className="mt-2 text-xs md:text-sm text-gray-500 font-bold tracking-[0.3em] uppercase">SISTEM PELAPORAN DIGITAL PANTAS DAN EFISIEN</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4">
        <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-gray-100">
          <div className="p-6 md:p-10 space-y-12">
            
            {/* 1. Bidang & Peringkat */}
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${theme.gradient} text-white`}><PlusCircle size={24} /></div>
                <h2 className="text-xl font-black text-gray-800 uppercase">1. Bidang & Peringkat</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Bidang</label>
                  <select name="bidang" value={formData.bidang} onChange={handleInputChange} className={`w-full p-4 rounded-xl border-2 font-bold ${theme.border} bg-white text-black`}>
                    <option value={BidangType.PENTADBIRAN}>PENTADBIRAN</option>
                    <option value={BidangType.HEM}>HEM</option>
                    <option value={BidangType.KURIKULUM}>KURIKULUM</option>
                    <option value={BidangType.KOKURIKULUM}>KOKURIKULUM</option>
                    <option value={BidangType.KESENIAN}>KESENIAN</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Peringkat</label>
                  <select name="peringkat" value={formData.peringkat} onChange={handleInputChange} className="w-full p-4 rounded-xl border-2 border-gray-200 font-bold bg-white text-black">
                    {Object.values(PeringkatType).map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Tahun</label>
                  <input type="text" name="tahun" value={formData.tahun} onChange={handleInputChange} className="w-full p-4 rounded-xl border-2 border-gray-200 font-bold text-black" />
                </div>
              </div>
            </section>

            {/* 2. Maklumat Program */}
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${theme.gradient} text-white`}><FileText size={24} /></div>
                <h2 className="text-xl font-black text-gray-800 uppercase">2. Maklumat Program</h2>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Tajuk Program / Aktiviti</label>
                  <input type="text" name="tajuk" value={formData.tajuk} onChange={handleInputChange} placeholder="CONTOH: KEJOHANAN MERENTAS DESA SSEMJ" className={`w-full p-4 md:p-5 rounded-xl border-2 font-black text-lg uppercase ${theme.border} text-black`} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Lokasi / Tempat</label>
                    <input type="text" name="lokasi" value={formData.lokasi} onChange={handleInputChange} className="w-full p-4 rounded-xl border-2 border-gray-200 font-bold text-black uppercase" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Anjuran / Unit</label>
                    <input type="text" name="anjuran" value={formData.anjuran} onChange={handleInputChange} className="w-full p-4 rounded-xl border-2 border-gray-200 font-bold text-black uppercase" />
                  </div>
                </div>
              </div>
            </section>

            {/* 4. Kandungan AI */}
            <section className="space-y-8">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${theme.gradient} text-white`}><Sparkles size={24} /></div>
                <h2 className="text-xl font-black text-gray-800 uppercase">4. Kandungan (Bantuan AI)</h2>
              </div>
              <div className="space-y-10">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Objektif Program</label>
                    <button type="button" onClick={callAIObjectives} disabled={loadingAI.obj} className={`flex items-center gap-2 text-[10px] px-4 py-2 rounded-full ${theme.gradient} text-white font-black shadow-md disabled:opacity-50`}>
                      {loadingAI.obj ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} GUNA AI
                    </button>
                  </div>
                  <textarea name="objektif" value={formData.objektif} onChange={handleInputChange} rows={4} className="w-full p-5 rounded-2xl border-2 border-gray-100 bg-gray-50 text-black leading-relaxed font-medium" placeholder="Objektif program..."></textarea>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Impak dan Rumusan</label>
                    <button type="button" onClick={callAISummary} disabled={loadingAI.impak} className={`flex items-center gap-2 text-[10px] px-4 py-2 rounded-full ${theme.gradient} text-white font-black shadow-md disabled:opacity-50`}>
                      {loadingAI.impak ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} GUNA AI
                    </button>
                  </div>
                  <textarea name="impak" value={formData.impak} onChange={handleInputChange} rows={4} className="w-full p-5 rounded-2xl border-2 border-gray-100 bg-gray-50 text-black leading-relaxed font-medium" placeholder="Impak program..."></textarea>
                </div>
              </div>
            </section>

            {/* 7. Penyedia Laporan */}
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${theme.gradient} text-white`}><PenTool size={24} /></div>
                <h2 className="text-xl font-black text-gray-800 uppercase">7. Maklumat Penyedia Laporan</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Nama Penuh</label>
                    <input type="text" name="namaPenyedia" value={formData.namaPenyedia} onChange={handleInputChange} placeholder="Nama penuh..." className="w-full p-4 rounded-xl border-2 border-gray-200 font-bold text-black uppercase" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Kategori</label>
                      <select name="kategoriPenyedia" value={formData.kategoriPenyedia} onChange={handleInputChange} className="w-full p-4 rounded-xl border-2 border-gray-200 font-bold text-black">
                        {Object.values(KategoriJawatan).map(k => <option key={k} value={k}>{k}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Sub-Bidang</label>
                      <select name="subKategoriPenyedia" value={formData.subKategoriPenyedia} onChange={handleInputChange} className="w-full p-4 rounded-xl border-2 border-gray-200 font-bold text-black">
                        {SUB_KATEGORI_OPTIONS[formData.kategoriPenyedia].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-4">Tandatangan Digital</label>
                  <SignaturePad onSave={(dataUrl) => setFormData(prev => ({ ...prev, signature: dataUrl }))} initialValue={formData.signature} />
                </div>
              </div>
            </section>
          </div>

          <div className="bg-slate-100 p-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <button type="button" onClick={handleReset} className="text-red-600 font-black text-xs uppercase tracking-widest flex items-center gap-2"><RotateCcw size={18} /> SET SEMULA</button>
            <div className="flex gap-4">
              <button type="button" onClick={() => setShowPreview(true)} className="px-8 py-4 bg-white border-2 border-gray-200 font-black text-gray-700 rounded-2xl shadow-sm hover:shadow-md transition-all uppercase text-xs">LIHAT PREVIEW</button>
              <button type="button" onClick={generatePDF} disabled={isGeneratingPDF} className={`px-10 py-4 ${theme.gradient} text-white font-black rounded-2xl shadow-lg flex items-center gap-3 disabled:opacity-70 uppercase tracking-widest text-xs`}>
                {isGeneratingPDF ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />} SAHKAN & JANA PDF
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Modal Preview */}
      {showPreview && (
        <div className="fixed inset-0 z-[100] bg-black bg-opacity-90 backdrop-blur-md flex flex-col items-center overflow-y-auto pt-10 pb-20">
          <div className="sticky top-0 w-full flex justify-end px-10 mb-6">
            <button onClick={() => setShowPreview(false)} className="bg-white text-black p-3 rounded-full shadow-xl"><X size={24} /></button>
          </div>
          <div className="transform scale-[0.4] sm:scale-[0.6] md:scale-[0.85] lg:scale-100 origin-top shadow-2xl">
            <ReportTemplate data={formData} id="report-template-view" />
          </div>
        </div>
      )}

      {/* Hidden Template for PDF Generation */}
      <div className="fixed -left-[4000px] top-0">
        <ReportTemplate data={formData} id="report-template-hidden" />
      </div>

      <footer className="mt-12 text-center text-gray-400 font-black uppercase text-[10px] tracking-widest pb-10">
        <p>&copy; 2026 SSEMJ OPR SYSTEM | DESIGNED BY SENIOR TECH TEAM</p>
      </footer>
    </div>
  );
};

export default App;
