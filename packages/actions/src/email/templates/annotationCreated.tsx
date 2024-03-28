'use client';
/* eslint-disable @next/next/no-img-element */
import React from 'react';
import {Tailwind, Body, Button, Container, Head, Html, Img, Row, Section, Text} from '@react-email/components';
import {emailTypes} from 'types';

export const AnnotationCreatedTemplate = ({stateName, stateImage, annotation}: emailTypes.iAnnotationCreatedData) => (
  <Tailwind
    config={{
      theme: {
        extend: {
          colors: {
            yellow: '#EBB500',
            'secondary-dark-blue': '#192033',
          },
        },
      },
    }}
  >
    <Html>
      <Head />
      <Body
        style={{
          backgroundColor: '#fff',
          fontFamily:
            '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
        }}
      >
        <Container className="bg-secondary-dark-blue h-screen px-4 flex flex-col justify-center items-center space-y-2 w-[380px]">
          <Img
            className="mx-auto mt-4"
            src={`https://aqhswtcebhzai9us.public.blob.vercel-storage.com/email-logo-lMNRUtVWULQczrDDjf06zIeVxv34Fh.png`}
          />
          <Text className="text-white mb-2">A thread was created on your project</Text>
          <Section
            className="mx-auto"
            style={{
              border: '1px solid #fff',
              borderRadius: '3px',
              overflow: 'hidden',
              padding: '20px',
            }}
          >
            <Row>
              <Img style={{height: '169px', width: '300px'}} src={stateImage} />
            </Row>
            <Row>
              <Text className="text-white mb-2">{stateName}</Text>
              <Text className="text-white mb-2">{`"${annotation}"`}</Text>
            </Row>
            <Row className="mb-2 flex">
              <Button className="bg-yellow py-1 text-center rounded w-[300px]">View in Glyphx</Button>
            </Row>
          </Section>
        </Container>
      </Body>
    </Html>
  </Tailwind>
);
