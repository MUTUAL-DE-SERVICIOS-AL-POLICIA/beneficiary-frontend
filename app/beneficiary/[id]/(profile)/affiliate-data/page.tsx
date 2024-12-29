'use client';
import { Divider } from '@nextui-org/divider';
import { useEffect, useState } from 'react';
import { EntryInfo } from './(sections)/EntryInfo';
import { StateInfo } from './(sections)/StateInfo';
import { ServiceInfo } from './(sections)/ServiceInfo';
import { DerelictInfo } from './(sections)/DerelictInfo';
import { getAffiliate, getAllDocuments, obtainAffiliateDocuments } from '@/app/beneficiary/service';
import { useBeneficiary } from '@/context/BeneficiaryContext';
import { AffiliateDocuments } from './(sections)/Documents';
import { useAlert } from '@/hooks/useAlerts';
import { Button } from '@nextui-org/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolderPlus, faRegistered } from '@fortawesome/free-solid-svg-icons';
import { Tooltip } from '@nextui-org/tooltip';
import ModalRegistrationComponent from '@/components/modal-registration';
import { apiClient } from '@/services';

export default function AffiliateDataPage() {
  const [affiliate, setAffiliate] = useState<any>({});
  const [documents, setDocuments] = useState<any>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [allDocuments, setAllDocuments] = useState<any>([]);
  const { beneficiaryData, error } = useBeneficiary();

  const { Alert } = useAlert();
  const toggleDialog = () => setIsDialogOpen(!isDialogOpen);

  const handleDocumentRecord = async () => {
    const response = await getAllDocuments();
    setAllDocuments(response.data);
    toggleDialog();
  };

  const registerFile = async (file: any, selectedKey: any) => {
    const formData = new FormData();
    formData.append('documentPdf', file);
    try {
      const response = await apiClient.POST(
        `/api/affiliates/${affiliate.id}/document/${selectedKey}/createOrUpdate`,
        formData,
        true,
      );
      console.log(response);
      const affiliateId = beneficiaryData.personAffiliate[0].typeId;
      const res = await obtainAffiliateDocuments(affiliateId);
      setDocuments(res.data);
    } catch (e: any) {
      console.log(e);
      console.error('Error al cargar el archivo');
    } finally {
      toggleDialog();
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!error) {
        if (beneficiaryData.personAffiliate.length >= 1) {
          const affiliateId = beneficiaryData.personAffiliate[0].typeId;
          const [affiliateData, documentsData] = await Promise.all([
            getAffiliate(`${affiliateId}`),
            obtainAffiliateDocuments(`${affiliateId}`),
          ]);
          if (!affiliateData.error) {
            const data = affiliateData.data;
            setAffiliate(data);
          } else {
            Alert({ message: affiliateData.message, variant: 'error' });
          }
          if (!documentsData.error) {
            const data = documentsData.data;
            setDocuments(data);
          } else {
            Alert({ message: affiliateData.message, variant: 'error' });
          }
        }
      } else {
        Alert({ message: beneficiaryData.message, variant: 'error' });
      }
    };
    fetchData();
  }, [beneficiaryData]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-3">
      <div className="flex justify-between items-center">
        <h1 className="text-md uppercase font-semibold">Datos del Policia</h1>
      </div>
      <Divider className="bg-gray-400 mb-5 w-full" />
      <div className="px-3 py-1">
        <div className="flex gap-6">
          <div className="flex flex-col w-1/2">
            <EntryInfo affiliate={affiliate} />
          </div>
          <div className="flex flex-col w-1/2">
            <StateInfo affiliate={affiliate} />
          </div>
        </div>
      </div>
      <div className="px-3 py-1">
        <ServiceInfo affiliate={affiliate} />
      </div>
      <div className="px-3 py-1">
        <DerelictInfo affiliate={affiliate} />
      </div>
      <div className="flex justify-between items-center mr-3">
        <h1 className="text-md uppercase font-semibold">Documentos presentados</h1>
        <Tooltip content="Registrar nuevo documento">
          <Button isIconOnly onPress={handleDocumentRecord}>
            <FontAwesomeIcon icon={faFolderPlus} size="xl" />
          </Button>
        </Tooltip>
      </div>
      <Divider className="bg-gray-400 mb-5 w-full" />
      <div className="px-3 py-1">
        <div className="flex gap-1">
          <div className="flex flex-col w-full">
            <AffiliateDocuments affiliate={affiliate} documents={documents} />
          </div>
        </div>
      </div>
      <ModalRegistrationComponent
        open={isDialogOpen}
        onOpenChange={toggleDialog}
        data={allDocuments}
        action={registerFile}
      />
    </div>
  );
}
