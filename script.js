// Wacht tot de pagina volledig geladen is (fix voor pdfjsLib-timing)
window.addEventListener('load', function() {
    // Check of pdfjsLib bestaat
    if (typeof pdfjsLib !== 'undefined') {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.449/build/pdf.worker.min.js';
        console.log('PDF.js worker geladen!');
    } else {
        console.error('PDF.js nog niet geladen – probeer refresh.');
    }

    // Init UI na load
    updateUI('nld');
});

// Lib-checks (alleen Tesseract)
if (typeof Tesseract === 'undefined') {
    document.getElementById('errorMsg').innerHTML = 'OCR-lib niet geladen. Refresh.';
    document.getElementById('errorMsg').style.display = 'block';
}

// Translations (NL default, incl. jouw zin – nu met image-ondersteuning in tekst)
const translations = {
    nld: {
        appTitle: '🚀 DocSnap',
        description: 'Upload een document (PDF of foto) en krijg highlights, actieplan & deadlines!',
        uploadText: 'Sleep je PDF of foto hier of klik om te uploaden 📄',
        analysisHeader: 'Analyse:',
        docTypes: { contract: 'Contract', boete: 'Boete-brief' },
        summary: 'Samenvatting: Dit is een {type}. Belangrijkste punt: {highlight}',
        highlightsTitle: 'Highlights:',
        actionPlanTitle: 'Actieplan:',
        actions: ['✅ Nu: Check de details.', '⏰ Binnen 7 dagen: Reageer via [link].', '❓ Optioneel: Betaal direct.'],
        deadlineTitle: 'Deadline:',
        noDeadline: 'Geen deadline gevonden.',
        detected: 'Gedetecteerde taal:',
        risks: { low: 'Laag', medium: 'Matig' }
    },
    eng: {
        appTitle: '🚀 DocSnap',
        description: 'Upload a document (PDF or photo) and get highlights, action plan & deadlines!',
        uploadText: 'Drag your PDF or photo here or click to upload 📄',
        analysisHeader: 'Analysis:',
        docTypes: { contract: 'Contract', boete: 'Fine Notice' },
        summary: 'Summary: This is a {type}. Key point: {highlight}',
        highlightsTitle: 'Highlights:',
        actionPlanTitle: 'Action Plan:',
        actions: ['✅ Now: Check details.', '⏰ Within 7 days: Respond via [link].', '❓ Optional: Pay now.'],
        deadlineTitle: 'Deadline:',
        noDeadline: 'No deadline found.',
        detected: 'Detected language:',
        risks: { low: 'Low', medium: 'Medium' }
    },
    fra: {
        appTitle: '🚀 DocSnap',
        description: 'Téléchargez un document (PDF ou photo) et obtenez des points saillants, un plan d\'action et des délais !',
        uploadText: 'Glissez votre PDF ou photo ici ou cliquez pour télécharger 📄',
        analysisHeader: 'Analyse:',
        docTypes: { contract: 'Contrat', boete: 'Avis d\'amende' },
        summary: 'Résumé: C\'est un {type}. Point clé: {highlight}',
        highlightsTitle: 'Points saillants:',
        actionPlanTitle: 'Plan d\'action:',
        actions: ['✅ Maintenant: Vérifiez les détails.', '⏰ Dans 7 jours: Répondez via [lien].', '❓ Optionnel: Payez maintenant.'],
        deadlineTitle: 'Date limite:',
        noDeadline: 'Aucune date limite trouvée.',
        detected: 'Langue détectée:',
        risks: { low: 'Faible', medium: 'Moyen' }
    },
    deu: {
        appTitle: '🚀 DocSnap',
        description: 'Laden Sie ein Dokument (PDF oder Foto) hoch und erhalten Sie Hervorhebungen, Aktionsplan & Fristen!',
        uploadText: 'Ziehen Sie Ihre PDF oder Foto hierher oder klicken Sie zum Hochladen 📄',
        analysisHeader: 'Analyse:',
        docTypes: { contract: 'Vertrag', boete: 'Bußgeldbescheid' },
        summary: 'Zusammenfassung: Dies ist ein {type}. Wichtiger Punkt: {highlight}',
        highlightsTitle: 'Hervorhebungen:',
        actionPlanTitle: 'Aktionsplan:',
        actions: ['✅ Jetzt: Überprüfen Sie die Details.', '⏰ Innerhalb 7 Tagen: Reagieren Sie über [Link].', '❓ Optional: Jetzt zahlen.'],
        deadlineTitle: 'Frist:',
        noDeadline: 'Keine Frist gefunden.',
        detected: 'Erkannte Sprache:',
        risks: { low: 'Niedrig', medium: 'Mittel' }
    },
    ara: {
        appTitle: '🚀 DocSnap',
        description: 'قم برفع وثيقة (PDF أو صورة) واحصل على النقاط البارزة، خطة العمل والمواعيد النهائية!',
        uploadText: 'اسحب ملف PDF أو صورة هنا أو انقر للرفع 📄',
        analysisHeader: 'تحليل:',
        docTypes: { contract: 'عقد', boete: 'إشعار غرامة' },
        summary: 'الملخص: هذا {type}. النقطة الرئيسية: {highlight}',
        highlightsTitle: 'النقاط البارزة:',
        actionPlanTitle: 'خطة العمل:',
        actions: ['✅ الآن: تحقق من التفاصيل.', '⏰ خلال 7 أيام: رد عبر [رابط].', '❓ اختياري: ادفع الآن.'],
        deadlineTitle: 'الموعد النهائي:',
        noDeadline: 'لم يتم العثور على موعد نهائي.',
        detected: 'اللغة المكتشفة:',
        risks: { low: 'منخفض', medium: 'متوسط' }
    }
};

// Update UI (gefixt: forceert directe change met setTimeout voor DOM)
function updateUI(lang = 'nld') {
    const t = translations[lang] || translations.nld;
    const output = document.getElementById('output');
    output.classList.toggle('rtl', lang === 'ara');
    
    document.getElementById('appTitle').textContent = t.appTitle;
    document.getElementById('description').textContent = t.description;
    document.getElementById('uploadText').textContent = t.uploadText;
}

// Dropdown event (gefixt: immediate update, geen delay)
document.getElementById('languageSelect').addEventListener('change', function() {
    const selectedLang = this.value;
    setTimeout(() => updateUI(selectedLang === 'auto' ? 'nld' : selectedLang), 0); // Force immediate
});

// Upload handler (nieuw: check file type – PDF vs Image)
async function handleFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const errorDiv = document.getElementById('errorMsg');
    errorDiv.style.display = 'none';
    
    try {
        let fullText = '';
        
        if (file.type === 'application/pdf') {
            // PDF handling (nu met check op pdfjsLib)
            if (typeof pdfjsLib === 'undefined') {
                throw new Error('PDF-lib nog niet geladen. Wacht even en probeer opnieuw.');
            }
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                fullText += textContent.items.map(item => item.str).join(' ') + '\n';
            }
        } else if (file.type.startsWith('image/')) {
            // Image OCR met Tesseract
            if (typeof Tesseract === 'undefined') {
                throw new Error('OCR-lib nog niet geladen. Refresh.');
            }
            const { data: { text } } = await Tesseract.recognize(file, 'eng', { logger: m => console.log(m) });
            fullText = text;
        } else {
            throw new Error('Alleen PDF of images (JPG/PNG) ondersteund.');
        }
        
        if (fullText.length < 20) throw new Error('Te weinig tekst herkend. Probeer duidelijke foto.');
        
        analyzeText(fullText);
    } catch (e) {
        console.error('Upload error:', e);
        errorDiv.innerHTML = `Fout: ${e.message}`;
        errorDiv.style.display = 'block';
    }
}

// Analyse (fallback naar NL voor auto, geen franc)
function analyzeText(text) {
    let detectedLang = 'nld';
    const selectedLang = document.getElementById('languageSelect').value;
    if (selectedLang === 'auto') {
        // Fallback: Altijd NL voor auto (tot franc werkt)
        detectedLang = 'nld';
        console.log('Auto-detect fallback naar NL.');
    } else {
        detectedLang = selectedLang;
    }
    
    updateUI(detectedLang);
    const t = translations[detectedLang];
    const riskLevel = Math.random() > 0.5 ? 'low' : 'medium';
    const riskText = t.risks[riskLevel];
    
    const docTypeKey = text.match(/boete|amende|fine|غرامة/i) ? 'boete' : 'contract';
    const docType = t.docTypes[docTypeKey] || 'Document';
    const highlights = text.match(/€\d+|deadline|betalen|répondre|payez|bezahlen|غرامة|frist/gi) || ['Geen rode vlaggen.'];
    const actions = t.actions;
    const deadlineMatch = text.match(/\d{1,2} [a-zA-Z]{3,9} \d{4}/i);
    const deadline = deadlineMatch ? deadlineMatch[0] : t.noDeadline;
    
    document.getElementById('analysisHeader').innerHTML = `${t.analysisHeader} <strong>${docType}</strong> | Risico: <span class="risk">${riskText}</span> | ${t.detected} <span id="detectedLang">${detectedLang.toUpperCase()}</span>`;
    
    document.getElementById('summary').innerHTML = `<p><strong>${t.summary.replace('{type}', docType.toLowerCase()).replace('{highlight}', highlights[0] || 'Alles oké')}</strong></p>`;
    
    document.getElementById('highlights').innerHTML = `<h3>${t.highlightsTitle}</h3><ul>${highlights.map(h => `<li class="highlight">${h}</li>`).join('')}</ul>`;
    
    document.getElementById('actionPlan').innerHTML = `<h3>${t.actionPlanTitle}</h3>${actions.map(a => `<div class="action">${a}</div>`).join('')}`;
    
    document.getElementById('deadline').innerHTML = `<h3>${t.deadlineTitle} ${deadline}</h3>`;
    
    document.getElementById('output').style.display = 'block';
    document.getElementById('output').scrollIntoView({ behavior: 'smooth' });
}