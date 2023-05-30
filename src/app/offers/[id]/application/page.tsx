import { getOfferById } from '@services/infoJobs/getOfferById';
import { redirect } from 'next/navigation';
import React from 'react';
import { GetOfferByIdApiResponse } from '../../../../types';
import { ApplicationTemplate } from '@components/website/offerApplication/ApplicationTemplate';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Aplicación Oferta de trabajo',
};

export default async function Offer({
  params: { id },
}: {
  params: { id: string };
}) {
  let offer: GetOfferByIdApiResponse;
  try {
    offer = await getOfferById(id);
  } catch (error) {
    redirect('/');
  }
  return <ApplicationTemplate {...offer} />;
}
