const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp, Timestamp } = require('firebase/firestore');

// Firebase config - you'll need to add your config here
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Helper function to convert ISO string to Firestore Timestamp or null
const toTimestamp = (isoString) => {
  if (!isoString) return null;
  return Timestamp.fromDate(new Date(isoString));
};

const dummyJobs = [
  // OPEN JOBS (not yet accepted)
  {
    title: "HVAC System Emergency Repair",
    description: "Air conditioning unit completely failed in server room. Critical temperature control needed immediately to prevent equipment damage. Unit shows error code E4 and makes loud grinding noise.",
    company: "TechCorp Solutions",
    status: "open",
    invoiced: false,
  },
  {
    title: "Electrical Panel Safety Inspection",
    description: "Annual safety inspection required for main electrical panel. Previous inspection expired last month. Must comply with local building codes.",
    company: "Downtown Office Plaza",
    status: "open",
    invoiced: false,
  },
  {
    title: "Plumbing Leak in Basement",
    description: "Water leak detected near water main connection. Facility management reports water pooling and potential structural concerns.",
    company: "Metro Manufacturing",
    status: "open",
    invoiced: false,
  },

  // ACCEPTED JOBS (assigned but work not started)
  {
    title: "Fire Safety System Maintenance",
    description: "Quarterly maintenance of fire suppression system including sprinklers, alarms, and emergency exits. Full building inspection required per insurance policy.",
    company: "City Medical Center",
    status: "accepted",
    acceptedBy: "Mike",
    invoiced: false,
  },
  {
    title: "Generator Load Testing",
    description: "Monthly load test of backup generator system. Previous test showed minor voltage fluctuations that need investigation.",
    company: "Data Center West",
    status: "accepted",
    acceptedBy: "Sarah",
    invoiced: false,
  },

  // ONSITE JOBS (work in progress)
  {
    title: "Roof Leak Emergency Repair",
    description: "Multiple leaks reported during heavy rain. Water damage spreading to office areas below. Immediate tarping and permanent repair needed.",
    company: "Westside Business Park",
    status: "onsite",
    acceptedBy: "David",
    onsiteTime: "2024-01-15T08:30:00Z",
    invoiced: false,
    workStartedImage: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=300&fit=crop",
    workStartedNotes: "Arrived on site. Multiple leak points identified on east side of roof. Temporary tarps installed to prevent further water damage. Beginning permanent membrane repair work.",
  },
  {
    title: "Network Cable Installation",
    description: "Install new network cabling for expanded office space. Run CAT6 cables to 20 new workstations. Include patch panel connections and testing.",
    company: "Growing Startup Inc",
    status: "onsite",
    acceptedBy: "Alex",
    onsiteTime: "2024-01-16T07:00:00Z",
    invoiced: false,
    workStartedImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
    workStartedNotes: "Cable routing planned and marked. Began pulling cables through ceiling. First 10 drops completed successfully. Network testing in progress.",
  },

  // COMPLETED JOBS (work finished)
  {
    title: "Security Camera System Upgrade",
    description: "Replace 12 analog cameras with new IP cameras. Include new NVR system and mobile app access for remote monitoring.",
    company: "Retail Chain Store #47",
    status: "completed",
    acceptedBy: "James",
    onsiteTime: "2024-01-10T09:00:00Z",
    completedTime: "2024-01-10T16:30:00Z",
    invoiced: false,
    workStartedImage: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=300&fit=crop",
    workStartedNotes: "Old analog system removed. New IP camera locations marked and verified with store manager. Power and network runs completed.",
    workCompletedImage: "https://images.unsplash.com/photo-1609220136736-443140cffec6?w=400&h=300&fit=crop",
    workCompletedNotes: "All 12 IP cameras installed and configured. NVR system operational with 30-day recording capacity. Mobile app set up for store manager. All cameras tested and functioning properly. System documentation provided.",
  },
  {
    title: "HVAC Filter Replacement & Tune-up",
    description: "Quarterly HVAC maintenance including filter replacement, coil cleaning, and system performance check. Building has 4 rooftop units.",
    company: "Professional Services Building",
    status: "completed",
    acceptedBy: "Lisa",
    onsiteTime: "2024-01-12T06:00:00Z",
    completedTime: "2024-01-12T11:45:00Z",
    invoiced: true,
    workStartedImage: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=300&fit=crop",
    workStartedNotes: "Pre-maintenance inspection complete. All 4 units accessible. Old filters heavily soiled and due for replacement. Beginning filter change and coil cleaning.",
    workCompletedImage: "https://images.unsplash.com/photo-1609220136736-443140cffec6?w=400&h=300&fit=crop",
    workCompletedNotes: "All units serviced successfully. New high-efficiency filters installed. Coils cleaned and inspected. System performance optimal. No issues found. Next maintenance due in 3 months.",
  },
  {
    title: "Parking Lot Light Repair",
    description: "Multiple LED parking lot lights not functioning. Safety concern for evening employees and customers. Estimated 8 lights need attention.",
    company: "Shopping Center Management",
    status: "completed",
    acceptedBy: "Carlos",
    onsiteTime: "2024-01-08T14:00:00Z",
    completedTime: "2024-01-08T18:20:00Z",
    invoiced: true,
    workStartedImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
    workStartedNotes: "Surveyed all parking lot lighting. Found 6 failed LED fixtures and 2 with damaged photocells. Beginning replacement work with boom lift.",
    workCompletedImage: "https://images.unsplash.com/photo-1609220136736-443140cffec6?w=400&h=300&fit=crop",
    workCompletedNotes: "All 6 LED fixtures replaced with new units. 2 photocells replaced. Full parking lot now properly illuminated. All lights tested and functioning correctly. 5-year warranty on new fixtures.",
  },

  // MORE VARIETY FOR BETTER TESTING
  {
    title: "Water Heater Replacement",
    description: "Commercial water heater failed completely. No hot water in building. Replacement needed urgently for restroom facilities and kitchen area.",
    company: "Office Complex Building B",
    status: "accepted",
    acceptedBy: "Tony",
    invoiced: false,
  },
  {
    title: "Access Control System Programming",
    description: "Program new employee key cards and update access permissions. Remove terminated employees from system. Add 15 new employees to various access levels.",
    company: "Corporate Headquarters",
    status: "open",
    invoiced: false,
  },
];

async function populateDummyData() {
  console.log('🚀 Starting to populate dummy data...');
  
  try {
    for (let i = 0; i < dummyJobs.length; i++) {
      const job = dummyJobs[i];
      console.log(`📝 Creating job ${i + 1}/${dummyJobs.length}: ${job.title}`);
      
      // Clean the job data - convert timestamps and remove null values
      const cleanJob = {
        title: job.title,
        description: job.description,
        company: job.company,
        status: job.status,
        invoiced: job.invoiced,
        createdAt: serverTimestamp(),
      };

      // Only add fields that exist and aren't null
      if (job.acceptedBy) cleanJob.acceptedBy = job.acceptedBy;
      if (job.onsiteTime) cleanJob.onsiteTime = job.onsiteTime;
      if (job.completedTime) cleanJob.completedTime = job.completedTime;
      if (job.workStartedImage) cleanJob.workStartedImage = job.workStartedImage;
      if (job.workStartedNotes) cleanJob.workStartedNotes = job.workStartedNotes;
      if (job.workCompletedImage) cleanJob.workCompletedImage = job.workCompletedImage;
      if (job.workCompletedNotes) cleanJob.workCompletedNotes = job.workCompletedNotes;
      
      const docRef = await addDoc(collection(db, 'jobs'), cleanJob);
      
      console.log(`✅ Created job with ID: ${docRef.id}`);
      
      // Small delay to avoid overwhelming Firebase
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    console.log('🎉 All dummy data created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error populating dummy data:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  }
}

populateDummyData(); 