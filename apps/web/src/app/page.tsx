import {AnnotationCreatedTemplate} from 'actions/src/email/templates';

// landing page
export default async function LandingPage() {
  return (
    // @ts-ignore
    <AnnotationCreatedTemplate stateName="State Name" stateImage="hello" annotation="This is the annotation" />
  );
}
