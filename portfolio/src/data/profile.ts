export interface EducationEntry {
  degree: string
  school: string
  years: string
  honors?: string
}

export const profile = {
  name: 'Genessis S. Contreras',
  title: 'Junior Software Engineer',
  location: 'Bacoor City, Cavite',
  email: 'genesis060102@gmail.com',
  phone: '0991 397 4400',
  linkedinUrl: 'https://www.linkedin.com/in/genessis-contreras-28320a375/',
  githubUrl: 'https://github.com/soominjo',
  education: [
    {
      degree: 'Bachelor of Science in Information Technology',
      school: 'Cavite State University - Bacoor City Campus',
      years: '2021 - 2025',
      honors: 'Graduated with Honors',
    },
    {
      degree: 'Information Communications Technology',
      school: 'Theresian School of Cavite',
      years: '2019 - 2021',
    },
  ] satisfies EducationEntry[],
  certifications: ['Introduction to Cybersecurity (Cisco)', 'Endpoint Security (Cisco)'],
}
