/* eslint-disable @next/next/no-img-element */
import React from 'react';
import {
  Body,
  Button,
  Container,
  Column,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Row,
  Section,
  Text,
} from '@react-email/components';
import {emailTypes} from 'types';

export const AnnotationCreatedTemplate = ({stateName, stateImage, annotation}: emailTypes.iAnnotationCreatedData) => (
  <Html>
    <Head />
    <Body style={main}>
      <Container
        style={{
          backgroundColor: 'rgb(25 32 51)',
          width: '15rem',
        }}
      >
        <Section style={logo}>
          <Img style={{width: '240px', height: '169px'}} src={`https://dev-app.glyphx.co/small-logo.png`} />
        </Section>
        <Section style={content}>
          <Row>
            <Text style={{color: 'white', marginBottom: '8px'}}>A thread was created on your project state</Text>
          </Row>
          <Row>
            <Img style={image} width={620} src={`https://dev-app.glyphx.co/project.png`} />
          </Row>
          <Row>
            <Text style={{color: 'white', marginBottom: '8px'}}>{stateName}</Text>
            <Text style={{color: 'white', marginBottom: '8px'}}>{annotation}</Text>
          </Row>
          <Row style={{padding: '20px', paddingTop: '0'}}>
            <Column style={{display: 'flex', justifyContent: 'center', width: '100%'}} colSpan={2}>
              <Button
                style={{
                  backgroundColor: 'rgb(235 181 0)',
                  borderRadius: 3,
                  color: '#FFF',
                  fontWeight: 'bold',
                  border: '1px solid rgb(0,0,0, 0.1)',
                  cursor: 'pointer',
                  padding: '12px 30px',
                }}
              >
                View in Glyphx
              </Button>
            </Column>
          </Row>
        </Section>
      </Container>
    </Body>
  </Html>
);

const main = {
  backgroundColor: '#fff',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const logo = {
  padding: '30px 20px',
};

const content = {
  border: '1px solid rgb(0,0,0, 0.1)',
  borderRadius: '3px',
  overflow: 'hidden',
};

const image = {
  maxWidth: '100%',
};
