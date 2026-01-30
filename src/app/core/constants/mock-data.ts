
export const INITIAL_DIETITIANS = [
    { id: 3, name: 'Sarah Dietitian', speciality: 'Weight Loss' },
    { id: 10, name: 'Dr. Mike Nutrition', speciality: 'Sports Nutrition' },
    { id: 11, name: 'Lisa Wellness', speciality: 'Diabetes Management' }
];

export const INITIAL_APPOINTMENTS = [
    {
        id: 1,
        patientId: 4,
        patientName: 'John Doe',
        dietitianId: 3,
        dietitianName: 'Sarah Dietitian',
        date: new Date(),
        timeSlot: '10:00 AM',
        status: 'Pending',
        description: 'Routine checkup'
    }
];
