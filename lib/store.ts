export type ApplicationStatus =
  | "Pending"
  | "Under Review"
  | "Approved"
  | "Rejected"
  | "Ready for Collection";

export type StaffRole = "officer" | "supervisor" | "admin" | "support";

export interface Document {
  name: string;
  type: string; // "birth_certificate" | "photo" | "proof_of_residence"
  uploadedAt: string;
}

export interface Notification {
  id: string;
  citizenEmail: string;
  message: string;
  channel: "portal" | "email" | "sms";
  read: boolean;
  createdAt: string;
}

export interface Application {
  id: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  district: string;
  village: string;
  phone: string;
  email: string;
  idType: string;
  status: ApplicationStatus;
  submittedAt: string;
  notes: string;
  documents: Document[];
  assignedOfficer?: string;
}

export interface CitizenUser {
  id: string;
  email: string;
  password: string;
  name: string;
}

export interface StaffUser {
  id: string;
  email: string;
  password: string;
  name: string;
  role: StaffRole;
  district: string;
}

const store: {
  applications: Application[];
  citizens: CitizenUser[];
  staff: StaffUser[];
  notifications: Notification[];
} = {
  applications: [
    {
      id: "LS-2025-0001",
      firstName: "Thabo",
      lastName: "Mokoena",
      dob: "1990-05-12",
      gender: "Male",
      district: "Maseru",
      village: "Ha Thetsane",
      phone: "+26658001234",
      email: "thabo@example.com",
      idType: "New ID",
      status: "Under Review",
      submittedAt: "2025-06-01",
      notes: "",
      documents: [
        { name: "birth_certificate.pdf", type: "birth_certificate", uploadedAt: "2025-06-01" },
        { name: "photo.jpg", type: "photo", uploadedAt: "2025-06-01" },
      ],
      assignedOfficer: "officer@homeaffairs.ls",
    },
    {
      id: "LS-2025-0002",
      firstName: "Palesa",
      lastName: "Letsie",
      dob: "1995-11-20",
      gender: "Female",
      district: "Leribe",
      village: "Hlotse",
      phone: "+26658005678",
      email: "palesa@example.com",
      idType: "Replacement ID",
      status: "Approved",
      submittedAt: "2025-05-28",
      notes: "Ready for collection at Leribe office.",
      documents: [
        { name: "birth_certificate.pdf", type: "birth_certificate", uploadedAt: "2025-05-28" },
        { name: "photo.jpg", type: "photo", uploadedAt: "2025-05-28" },
        { name: "proof_of_residence.pdf", type: "proof_of_residence", uploadedAt: "2025-05-28" },
      ],
    },
    {
      id: "LS-2025-0003",
      firstName: "Motlatsi",
      lastName: "Nkosi",
      dob: "1988-03-07",
      gender: "Male",
      district: "Berea",
      village: "Teyateyaneng",
      phone: "+26658009999",
      email: "motlatsi@example.com",
      idType: "New ID",
      status: "Pending",
      submittedAt: "2025-06-05",
      notes: "",
      documents: [
        { name: "birth_certificate.pdf", type: "birth_certificate", uploadedAt: "2025-06-05" },
      ],
    },
    {
      id: "LS-2025-0004",
      firstName: "Lineo",
      lastName: "Tau",
      dob: "2000-08-15",
      gender: "Female",
      district: "Maseru",
      village: "Mazenod",
      phone: "+26658001111",
      email: "lineo@example.com",
      idType: "Renewal",
      status: "Rejected",
      submittedAt: "2025-05-20",
      notes: "Proof of residence document is expired. Please resubmit.",
      documents: [
        { name: "birth_certificate.pdf", type: "birth_certificate", uploadedAt: "2025-05-20" },
        { name: "photo.jpg", type: "photo", uploadedAt: "2025-05-20" },
        { name: "proof_of_residence.pdf", type: "proof_of_residence", uploadedAt: "2025-05-20" },
      ],
    },
  ],
  citizens: [
    { id: "c1", email: "citizen@example.com", password: "password123", name: "Demo Citizen" },
  ],
  staff: [
    { id: "s1", email: "officer@homeaffairs.ls", password: "officer123", name: "Nthabiseng Molapo", role: "officer", district: "Maseru" },
    { id: "s2", email: "supervisor@homeaffairs.ls", password: "super123", name: "Retselisitsoe Phiri", role: "supervisor", district: "Maseru" },
    { id: "s3", email: "admin@homeaffairs.ls", password: "admin123", name: "System Administrator", role: "admin", district: "All" },
    { id: "s4", email: "support@homeaffairs.ls", password: "support123", name: "Teboho Leseli", role: "support", district: "Maseru" },
  ],
  notifications: [
    {
      id: "n1",
      citizenEmail: "palesa@example.com",
      message: "Your application LS-2025-0002 has been approved. Please collect your ID at the Leribe office.",
      channel: "portal",
      read: false,
      createdAt: "2025-06-02",
    },
    {
      id: "n2",
      citizenEmail: "lineo@example.com",
      message: "Your application LS-2025-0004 was rejected. Reason: Proof of residence document is expired. Please resubmit.",
      channel: "portal",
      read: false,
      createdAt: "2025-05-22",
    },
  ],
};

export default store;
