export enum AgreementType {
  USER_AGREEMENT = "USER_AGREEMENT",
  PRIVACY_POLICY = "PRIVACY_POLICY",
}

export interface PublishedAgreement {
  type: AgreementType;
  title: string;
  content: string;
  publishTime: string;
}
