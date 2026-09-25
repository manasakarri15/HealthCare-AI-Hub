import { HealthCategory } from '../types';

export const HEALTH_CATEGORIES: HealthCategory[] = [
  {
    id: 'diabetes',
    name: 'Diabetes Care',
    tagline: 'Precision metabolic monitoring, glycemic control & insulin management',
    iconName: 'Activity',
    overview: 'Diabetes mellitus encompasses metabolic conditions characterized by chronic hyperglycemia resulting from defects in insulin secretion, action, or both. Early identification of insulin resistance and pre-diabetes enables targeted lifestyle and pharmacological interventions that prevent vascular and microvascular complications.',
    keyStatistics: [
      'Over 537 million adults live with diabetes globally',
      'Up to 50% of people with type 2 diabetes remain undiagnosed',
      'Lifestyle modifications reduce pre-diabetes progression by 58%'
    ],
    symptoms: [
      'Increased thirst (polydipsia) and frequent urination',
      'Unexplained weight loss despite normal appetite',
      'Chronic fatigue and persistent midday energy crashes',
      'Blurred vision and slow-healing minor cuts or sores',
      'Tingling or numbness in hands, feet, or extremities'
    ],
    lifestyleTips: [
      'Prioritize high-fiber, low-glycemic foods (leafy greens, legumes, intact whole grains)',
      'Aim for 150+ minutes of moderate weekly cardio plus twice-weekly resistance workouts',
      'Practice meal sequencing: consume fiber and protein before starchy carbohydrates',
      'Track fasting and 2-hour post-prandial blood glucose trends consistently'
    ],
    clinicalRedFlags: [
      'Fasting plasma glucose persistently above 126 mg/dL',
      'Ketone presence in urine accompanied by nausea or vomiting',
      'Sudden visual disturbances or dark floaters',
      'Loss of sensation or acute ulcers on feet'
    ],
    specialistTitle: 'Endocrinologist & Diabetologist',
    hasAiAssessment: true,
  },
  {
    id: 'heart',
    name: 'Heart Health',
    tagline: 'Cardiovascular risk evaluation, hypertension control & lipid tracking',
    iconName: 'Heart',
    overview: 'Cardiovascular disease remains the leading cause of morbidity globally. Managing arterial stiffness, blood pressure, apolipoprotein B (ApoB), and coronary calcification through early detection preserves long-term heart and brain health.',
    keyStatistics: [
      'Cardiovascular diseases account for 32% of all global deaths',
      '80% of premature cardiovascular events are preventable',
      'Lowering systolic BP by 10 mmHg reduces stroke risk by 27%'
    ],
    symptoms: [
      'Chest tightness, pressure, or squeezing sensation on exertion',
      'Shortness of breath while lying flat or climbing stairs',
      'Unexplained palpitations or irregular heart flutter',
      'Swelling (edema) in lower legs, ankles, or feet',
      'Dizziness or lightheadedness upon standing quickly'
    ],
    lifestyleTips: [
      'Adopt an authentic Mediterranean or DASH eating pattern low in saturated fats',
      'Limit dietary sodium to under 2,000 mg/day; boost potassium via avocados and spinach',
      'Engage in Zone 2 aerobic base conditioning 3 to 4 times weekly',
      'Eliminate tobacco use and strictly monitor resting heart rate variability'
    ],
    clinicalRedFlags: [
      'Acute central chest pain radiating to left arm, neck, or jaw',
      'Sudden shortness of breath accompanied by cold sweating',
      'Resting blood pressure higher than 180/120 mmHg (hypertensive crisis)',
      'Unexplained syncope or loss of consciousness'
    ],
    specialistTitle: 'Cardiologist & Vascular Specialist',
    hasAiAssessment: false,
  },
  {
    id: 'skin',
    name: 'Skin Care & Dermatology',
    tagline: 'Dermatological screening, barrier restoration & clinical lesion tracking',
    iconName: 'Sparkles',
    overview: 'The skin is the body’s largest organ and first line of immune defense. Clinical dermatology addresses eczema, psoriasis, acne vulgaris, and early surveillance of pigmented lesions to prevent melanoma and squamous cell carcinomas.',
    keyStatistics: [
      '1 in 5 individuals will develop skin cancer in their lifetime',
      'Daily broad-spectrum sunscreen reduces melanoma risk by 50%',
      'Acne affects up to 85% of adolescents and 15% of adult women'
    ],
    symptoms: [
      'Persistent erythema (redness), scaling, or intense pruritus (itching)',
      'Asymmetrical moles with irregular borders or shifting colors (ABCDE criteria)',
      'Chronic cystic acne lesions resistant to over-the-counter benzoyl peroxide',
      'Sudden hives, wheals, or contact dermatitis flare-ups',
      'Skin dryness with compromised stratum corneum barrier flaking'
    ],
    lifestyleTips: [
      'Apply broad-spectrum mineral SPF 30+ every morning, rain or shine',
      'Incorporate barrier-supporting ceramides, niacinamide, and hyaluronic acid',
      'Avoid harsh mechanical scrubs and scalding hot showers',
      'Perform monthly self-examinations of skin moles in natural daylight'
    ],
    clinicalRedFlags: [
      'A mole that bleeds, oozes, or changes size rapidly over 4 weeks',
      'Non-healing ulcer or crusting lesion lasting longer than 6 weeks',
      'Sudden generalized rash accompanied by high fever or mucosal blistering'
    ],
    specialistTitle: 'Board-Certified Dermatologist',
    hasAiAssessment: false,
  },
  {
    id: 'women',
    name: "Women's Health",
    tagline: 'Hormonal equilibrium, reproductive wellness & preventive gynecology',
    iconName: 'Users',
    overview: 'Dedicated obstetrics and gynecology services covering polycystic ovary syndrome (PCOS), endometriosis, thyroid and fertility optimization, perimenopausal transition, and breast health surveillance.',
    keyStatistics: [
      'PCOS affects 8–13% of women of reproductive age',
      'Endometriosis takes an average of 7 years for clinical diagnosis',
      'Routine Pap smears reduce cervical cancer incidence by up to 80%'
    ],
    symptoms: [
      'Irregular, missed, or excessively heavy menstrual cycles (menorrhagia)',
      'Severe pelvic cramping unresponsive to standard anti-inflammatories',
      'Hot flashes, night sweats, and sudden mood lability',
      'Unexplained hirsutism, cystic hormonal jawline acne, or hair thinning',
      'Palpable breast lump or cyclical mastalgia'
    ],
    lifestyleTips: [
      'Support hormonal clearance with cruciferous vegetables (indole-3-carbinol)',
      'Ensure adequate intake of bioavailable iron, folate, and vitamin D3',
      'Prioritize sleep hygiene to regulate circadian melatonin and cortisol peaks',
      'Engage in pelvic floor muscle training and progressive resistance work'
    ],
    clinicalRedFlags: [
      'Post-menopausal bleeding or spotting of any quantity',
      'Sudden unilateral severe pelvic pain (rule out ovarian torsion/ectopic)',
      'New firm fixed breast mass with skin dimpling (peau d’orange)'
    ],
    specialistTitle: 'Obstetrician & Gynecologist (OB-GYN)',
    hasAiAssessment: false,
  },
  {
    id: 'bone',
    name: 'Bone & Joint Health',
    tagline: 'Orthopedic mobility, cartilage preservation & bone density management',
    iconName: 'Shield',
    overview: 'Musculoskeletal medicine focuses on preventing osteoporosis, managing degenerative joint disease (osteoarthritis), sports injuries, spinal biomechanics, and optimizing functional range of motion across all life stages.',
    keyStatistics: [
      'Osteoporosis causes more than 8.9 million fractures annually',
      '1 in 3 women over age 50 will experience osteoporotic fractures',
      'Low-impact resistance training increases bone mineral density by 1–3%'
    ],
    symptoms: [
      'Morning joint stiffness lasting more than 30 minutes',
      'Crepitus (grating sound) and swelling in knee, hip, or finger joints',
      'Localized spinal tenderness or gradual loss of standing height',
      'Sharp pain on weight-bearing during walking or stairs',
      'Reduced joint range of motion and muscular weakness around joints'
    ],
    lifestyleTips: [
      'Engage in weight-bearing exercise (hiking, resistance lifting, tennis)',
      'Maintain calcium intake (1,000–1,200 mg/day) paired with Vitamin D3 and K2',
      'Maintain an anti-inflammatory dietary profile rich in omega-3 fatty acids',
      'Optimize workstation ergonomics to protect cervical and lumbar alignment'
    ],
    clinicalRedFlags: [
      'Joint that becomes acutely hot, red, and swollen with high fever (septic arthritis)',
      'Inability to bear weight after fall or traumatic twisting injury',
      'Sudden numbness or weakness radiating down the legs (sciatica/cauda equina)'
    ],
    specialistTitle: 'Orthopedic Surgeon & Rheumatologist',
    hasAiAssessment: false,
  },
  {
    id: 'mental',
    name: 'Mental & Brain Health',
    tagline: 'Neuropsychiatric care, cognitive resilience & stress management',
    iconName: 'Smile',
    overview: 'Comprehensive behavioral health addressing generalized anxiety disorder, depressive episodes, chronic burnout, cognitive fatigue, and sleep architecture through evidence-backed psychiatric and lifestyle modalities.',
    keyStatistics: [
      '1 in 8 individuals worldwide live with a mental health condition',
      'Cognitive Behavioral Therapy (CBT) shows a 50–75% remission rate',
      'Regular aerobic exercise matches low-dose SSRIs for mild-to-moderate depression'
    ],
    symptoms: [
      'Persistent low mood, anhedonia (loss of pleasure), or emotional numbness',
      'Intrusive worry, panic attacks, or sensations of impending doom',
      'Early morning awakening, severe insomnia, or non-restorative sleep',
      'Brain fog, memory lapses, and severe executive dysfunction',
      'Appetite shifts accompanied by marked social withdrawal'
    ],
    lifestyleTips: [
      'Get 15–20 minutes of outdoor morning sunlight within 1 hour of waking',
      'Practice daily diaphragmatic breathing or physiological sighs (200 bpm down-regulation)',
      'Limit digital screen exposure and blue light 90 minutes before bedtime',
      'Stay connected with a supportive social community or therapy group'
    ],
    clinicalRedFlags: [
      'Intrusive suicidal thoughts or thoughts of self-harm (seek immediate crisis hotline)',
      'Severe auditory or visual hallucinations or manic sleep deprivation (>48h awake)',
      'Acute inability to care for basic biological necessities'
    ],
    specialistTitle: 'Psychiatrist & Clinical Psychologist',
    hasAiAssessment: false,
  },
  {
    id: 'general',
    name: 'General Health & Longevity',
    tagline: 'Preventive wellness, annual physicals & functional longevity biomarkers',
    iconName: 'Compass',
    overview: 'Primary care internal medicine dedicated to comprehensive health maintenance, biological age tracking, routine blood panels, immune defense, and preventive risk mitigation before clinical disease manifests.',
    keyStatistics: [
      'Annual preventive checkups detect 40% of asymptomatic conditions early',
      'Adhering to 5 key lifestyle factors increases healthy lifespan by 12–14 years',
      'Routine vaccination prevents millions of severe respiratory infections yearly'
    ],
    symptoms: [
      'Unexplained chronic low energy lasting more than 6 weeks',
      'Frequent recurrent colds, sinus infections, or slow healing',
      'Fluctuating bowel habits or persistent digestive discomfort',
      'Mild persistent fever or unexplained night sweats',
      'Subtle weight changes without alterations in diet'
    ],
    lifestyleTips: [
      'Schedule annual comprehensive metabolic panel (CMP), CBC, and lipid fractions',
      'Prioritize 7.5 to 8.5 hours of uninterrupted sleep per night',
      'Hydrate with 2.5 to 3 liters of water daily with balanced electrolytes',
      'Cultivate stress resilience through mindfulness, social bonds, and purpose'
    ],
    clinicalRedFlags: [
      'Unintentional loss of more than 5% of body weight within 6 months',
      'Persistent high fever above 102°F (38.9°C) lasting more than 3 days',
      'Persistent changes in bowel or bladder function lasting >3 weeks'
    ],
    specialistTitle: 'Internal Medicine & Primary Care Physician',
    hasAiAssessment: false,
  },
];
