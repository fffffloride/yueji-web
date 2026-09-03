export enum AgreementType {
  USER_AGREEMENT = "USER_AGREEMENT",
  PRIVACY_POLICY = "PRIVACY_POLICY",
  MEDICAL_INFORMED_CONSENT = "MEDICAL_INFORMED_CONSENT",
}

export interface PublishedAgreement {
  type: AgreementType;
  title: string;
  content: string;
  publishTime: string;
}
