from flask import Flask, request, jsonify
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from googletrans import Translator
import os

app = Flask(__name__)

def create_medical_csv():
    """Create the medical specialties CSV file if it doesn't exist"""
    data = {
        'Specialty': ['Cardiologist', 'Neurologist', 'Dermatologist', 'Gastroenterologist', 'Psychiatrist', 'Rheumatologist', 'General Practitioner', 'Orthopedic Surgeon', 'Dentist', 'Ophthalmologist'],
        'Field': ['Cardiology', 'Neurology', 'Dermatology', 'Gastroenterology', 'Psychiatry', 'Rheumatology', 'General Medicine', 'Orthopedics', 'Dentistry', 'Ophthalmology'],
        'Focus': [
            'Diagnoses and treats diseases of the heart and blood vessels.',
            'Treats disorders of the nervous system (brain, spinal cord, nerves).',
            'Treats skin, hair, and nail conditions.',
            'Treats disorders of the digestive system (esophagus, stomach, intestines, liver, pancreas).',
            'Diagnoses and treats mental, emotional, and behavioral disorders.',
            'Treats autoimmune diseases and disorders of the joints, muscles, and bones.',
            'Provides primary care for all common medical conditions and refers to specialists.',
            'Treats musculoskeletal system (bones, joints, ligaments, tendons, muscles).',
            'Diagnoses and treats problems of the teeth, gums, and mouth.',
            'Treats diseases and disorders of the eyes and vision.'
        ],
        'Conditions Treated (English)': [
            'Chest pain; Shortness of breath; Heart attack; Heart failure; Arrhythmias; Hypertension; Coronary artery disease',
            'Headache; Stroke; Epilepsy; Multiple Sclerosis; Parkinson Disease; Alzheimer Disease; Neuropathy',
            'Skin Rash; Acne; Psoriasis; Skin Cancer; Warts; Fungal Infections; Rosacea',
            'Stomach Pain; Acid Reflux; Irritable Bowel Syndrome; Inflammatory Bowel Disease; Peptic Ulcers; Gallstones',
            'Anxiety; Depression; Bipolar Disorder; Schizophrenia; OCD; PTSD; ADHD; Eating Disorders',
            'Joint Pain; Osteoarthritis; Rheumatoid Arthritis; Gout; Lupus; Fibromyalgia; Ankylosing Spondylitis',
            'Fever; Cold; Flu; Infections; Minor Injuries; Hypertension; Diabetes; Asthma',
            'Back Pain; Herniated Disc; Sciatica; Arthritis; Carpal Tunnel; Fractures; Sports Injuries',
            'Toothache; Cavities; Gum Disease; Tooth Decay; Root Canal; Wisdom Teeth; Oral Cancer',
            'Eye Irritation; Conjunctivitis; Glaucoma; Cataracts; Macular Degeneration; Dry Eye; Refractive Errors'
        ],
        'Spécialité (Français)': ['Cardiologue', 'Neurologue', 'Dermatologue', 'Gastro-entérologue', 'Psychiatre', 'Rhumatologue', 'Médecin Généraliste', 'Chirurgien Orthopédiste', 'Dentiste', 'Ophtalmologiste'],
        'Domaine (Français)': ['Cardiologie', 'Neurologie', 'Dermatologie', 'Gastro-entérologie', 'Psychiatrie', 'Rhumatologie', 'Médecine Générale', 'Orthopédie', 'Dentisterie', 'Ophtalmologie'],
        'Affections traitées (Français)': [
            'Douleur thoracique; Essoufflement; Crise cardiaque; Insuffisance cardiaque; Arythmies; Hypertension',
            'Mal de tête; Accident Vasculaire Cérébral; Épilepsie; Sclérose en Plaques; Maladie de Parkinson',
            'Éruption cutanée; Acné; Psoriasis; Cancer de la Peau; Verrues; Infections Fongiques',
            'Douleur à l Estomac; Reflux Acide; Syndrome du Côlon Irritable; Maladie Inflammatoire de l Intestin',
            'Anxiété; Dépression; Trouble Bipolaire; Schizophrénie; TOC; ESPT; TDAH',
            'Douleur Articulaire; Arthrose; Polyarthrite Rhumatoïde; Goutte; Lupus; Fibromyalgie',
            'Fièvre; Rhume; Grippe; Infections; Blessures Mineures; Hypertension; Diabète',
            'Mal de Dos; Hernie Discale; Sciatique; Arthrose; Canal Carpien; Fractures',
            'Mal de Dents; Caries Dentaires; Maladie des Gencives; Dévitalisation; Dents de Sagesse',
            'Œil Rouge; Conjonctivite; Glaucome; Cataracte; Dégénérescence Maculaire; Œil Sec'
        ],
        'التخصص': ['طبيب قلب', 'طبيب أعصاب', 'طبيب جلدية', 'طبيب جهاز هضمي', 'طبيب نفسي', 'طبيب روماتيزم', 'طبيب عام', 'جراح عظام', 'طبيب أسنان', 'طبيب عيون'],
        'المجال': ['طب القلب', 'طب الأعصاب', 'طب الجلد', 'طب الجهاز الهضمي', 'الطب النفسي', 'طب الروماتيزم', 'الطب العام', 'جراحة العظام', 'طب الأسنان', 'طب العيون'],
        'الحالات التي يعالجها': [
            'ألم الصدر; ضيق النفس; النوبة القلبية; فشل القلب; عدم انتظام ضربات القلب; ارتفاع ضغط الدم',
            'الصداع; السكتة الدماغية; الصرع; التصلب المتعدد; مرض باركنسون; مرض الزهايمر',
            'الطفح الجلدي; حب الشباب; الصدفية; سرطان الجلد; الثآليل; العدوى الفطرية',
            'ألم المعدة; الارتجاع المعدي المريئي; متلازمة القولون العصبي; مرض الأمعاء الالتهابي',
            'القلق; الاكتئاب; الاضطراب ثنائي القطب; الفصام; الوسواس القهري; اضطراب ما بعد الصدمة',
            'ألم المفاصل; الفصال العظمي; التهاب المفاصل الروماتويدي; النقرس; الذئبة; فيبروميالغيا',
            'الحمى; نزلات البرد; الإنفلونزا; العدوى; الإصابات البسيطة; ارتفاع ضغط الدم',
            'ألم الظهر; الانزلاق الغضروفي; عرق النسا; التهاب المفاصل; متلازمة النفق الرسغي',
            'ألم الأسنان; تسوس الأسنان; أمراض اللثة; نخر الأسنان; علاج الجذور; أضراس العقل',
            'احمرار العين; التهاب الملتحمة; الزَرَق; الساد; التنكس البقعي; جفاف العين'
        ]
    }
    
    df = pd.DataFrame(data)
    df.to_csv("doctor_specialties_conditions.csv", index=False, encoding='utf-8')
    print("✅ Created medical specialties CSV file")
    return df

# --- Load dataset ---
try:
    data = pd.read_csv("doctor_specialties_conditions.csv")
    print("✅ CSV loaded successfully")
except Exception as e:
    print(f"❌ Error loading CSV: {e}")
    print("🔄 Creating new CSV file...")
    data = create_medical_csv()

# Combine all languages and condition names into one column for better matching
data["All_Conditions"] = (
    data["Conditions Treated (English)"].fillna('') + '; ' +
    data["Affections traitées (Français)"].fillna('') + '; ' +
    data["الحالات التي يعالجها"].fillna('')
)

# --- Prepare vectorizer ---
vectorizer = TfidfVectorizer(stop_words="english", analyzer='word', ngram_range=(1, 2))
X = vectorizer.fit_transform(data["All_Conditions"])

translator = Translator()

@app.route("/")
def home():
    return jsonify({
        "message": "Medical Specialty Recommendation API",
        "status": "running",
        "endpoints": {
            "analyze": "POST /analyze with JSON {'text': 'symptom description'}"
        }
    })

@app.route("/analyze", methods=["POST"])
def analyze():
    content = request.get_json()
    if not content:
        return jsonify({"error": "No JSON data provided"}), 400
        
    text = content.get("text", "").strip()

    if not text:
        return jsonify({"error": "No text provided"}), 400

    # --- Try to auto-detect and translate to English for NLP ---
    detected_lang = "unknown"
    try:
        detected = translator.detect(text)
        detected_lang = detected.lang
        if detected.lang != "en":
            translated_text = translator.translate(text, src=detected.lang, dest="en").text
        else:
            translated_text = text
    except Exception as e:
        print(f"Translation error: {e}")
        translated_text = text  # continue with the text as-is if translator fails

    # --- Compute similarity ---
    try:
        input_vec = vectorizer.transform([translated_text])
        sims = cosine_similarity(input_vec, X)
        idx = sims.argmax()
        similarity_score = sims[0][idx]

        specialty = data.iloc[idx]["Specialty"]
        field = data.iloc[idx]["Field"]
        focus = data.iloc[idx]["Focus"]
        matched_conditions = data.iloc[idx]["Conditions Treated (English)"]

        specialty_fr = data.iloc[idx]["Spécialité (Français)"]
        field_fr = data.iloc[idx]["Domaine (Français)"]
        
        specialty_ar = data.iloc[idx]["التخصص"]
        field_ar = data.iloc[idx]["المجال"]

        return jsonify({
            "input_text": text,
            "detected_language": detected_lang,
            "confidence_score": float(similarity_score),
            "recommended_specialty_en": specialty,
            "recommended_specialty_fr": specialty_fr,
            "recommended_specialty_ar": specialty_ar,
            "field_en": field,
            "field_fr": field_fr,
            "field_ar": field_ar,
            "focus": focus,
            "related_conditions": matched_conditions.split('; ')
        })
    
    except Exception as e:
        return jsonify({"error": f"Analysis error: {str(e)}"}), 500

@app.route("/specialties", methods=["GET"])
def get_specialties():
    """Get list of all available specialties"""
    specialties = data[['Specialty', 'Spécialité (Français)', 'التخصص']].to_dict('records')
    return jsonify({"specialties": specialties})

if __name__ == "__main__":
    print("🏥 Medical Specialty Recommendation API Starting...")
    print(f"📊 Loaded {len(data)} medical specialties")
    app.run(host="0.0.0.0", port=5001, debug=True)