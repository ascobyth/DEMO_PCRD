export interface Sample {
  id?: string;
  category: string;
  grade?: string;
  lot?: string;
  sampleIdentity: string;
  type: string;
  form: string;
  tech?: string;
  feature?: string;
  plant?: string;
  samplingDate?: string;
  samplingTime?: string;
  generatedName: string;
}

export interface SampleSet {
  _id: string;
  id?: string;
  name?: string;
  sampleSetName: string;
  description?: string;
  samples: Sample[];
  requesterName: string;
  requesterEmail: string;
  ioNumber?: string;
  sampleCount: number;
  createdAt: string;
  isOwner?: boolean;
}

export interface AppTechOption {
  value: string;
  label: string;
  shortText: string;
}

export interface SelectOption {
  value: string;
  label: string;
}

export type SampleCategory = "commercial" | "td" | "benchmark" | "inprocess" | "chemicals" | "cap";

export interface SampleFormProps {
  formData: {
    samples: Sample[];
    ioNumber?: string;
  };
  onSamplesChange: (samples: Sample[]) => void;
  user?: {
    name: string;
    email: string;
  };
}