// lib/usnHelper.ts

// 1. Branch Mapping Dictionary
const branchMap: { [key: string]: string } = {
    'CS': 'Computer Science & Engg.',
    'IS': 'Information Science & Engg.',
    'EC': 'Electronics & Communication',
    'EE': 'Electrical & Electronics',
    'CV': 'Civil Engineering',
    'ME': 'Mechanical Engineering',
    'BT': 'Biotechnology',
    'CH': 'Chemical Engineering',
    'CI': 'Artificial Intelligence & Machine Learning (AIML)',
  };
  
  export function getBranchFromUSN(usn: string): string {
    const cleanUSN = usn.toUpperCase().trim();
    // Extract the branch code (e.g., the 'CS' part between year and roll no)
    // Regex looks for 2 or 3 letters after the initial part and year digits
    const match = cleanUSN.match(/^(1|4)SI\d{2}([A-Z]{2,3})\d{3}$/);
    
    if (match && match[2]) {
      const code = match[2];
      return branchMap[code] || code + ' (Unknown Branch)';
    }
    return 'Unknown Branch';
  }
  
  // 2. Year Calculation Logic
  export function calculateYearFromUSN(usn: string): string {
    const cleanUSN = usn.toUpperCase().trim();
    // Extract admission year (e.g., '24' from 1SI24...)
    const match = cleanUSN.match(/^(1|4)SI(\d{2})/);
    
    if (!match || !match[2]) return 'Unknown Year';
  
    const admissionYearShort = parseInt(match[2], 10);
    const admissionYearFull = 2000 + admissionYearShort; // e.g., 2024
  
    const today = new Date();
    const currentMonth = today.getMonth(); // 0 = Jan, 7 = Aug, 11 = Dec
    const currentCalendarYear = today.getFullYear();
  
    // Academic year usually starts around August (Month index 7).
    // If we are currently before August (Jan-July), the current academic year started last calendar year.
    let currentAcademicYearStart = currentCalendarYear;
    if (currentMonth < 7) { 
        currentAcademicYearStart = currentCalendarYear - 1;
    }
  
    // Calculate difference (add 1 because 2024-2024 means 1st year)
    const yearDiff = (currentAcademicYearStart - admissionYearFull) + 1;
  
    if (yearDiff <= 1) return '1st';
    if (yearDiff === 2) return '2nd';
    if (yearDiff === 3) return '3rd';
    if (yearDiff >= 4) return '4th';
    
    return 'Alumni/Unknown';
  }