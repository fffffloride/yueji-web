import { request } from "@/utils/request";
import type { AgreementType, PublishedAgreement } from "./types";

const AgreementAPI = {
  get(type: AgreementType) {
    return request<PublishedAgreement>({
      url: `/app/agreements/${type}`,
      skipAuth: true,
    });
  },
};

export default AgreementAPI;
export * from "./types";
