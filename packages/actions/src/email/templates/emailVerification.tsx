/* eslint-disable @next/next/no-img-element */
// import React from 'react';
import {emailTypes} from 'types';

// export const EmailVerificationTemplate = ({url}: emailTypes.iEmailVerificationData) => {
//   return (
//     <div className="mx-auto max-w-lg rounded-lg">
//       <div className="text-center py-2.5 text-xl font-sans text-text">
//         Sign in to <strong>Glyphx</strong>
//       </div>
//       <div className="text-center py-2.5">
//         {/* Glyphx Full Logo */}
//         <img alt="logo" src="https://app.glyphx.co/icon" className="h-40" />
//       </div>
//       <div className="text-center py-5">
//         <div className="rounded-md bg-buttonBackground">
//           <a
//             href={url}
//             target="_blank"
//             className="text-lg font-sans text-buttonText no-underline rounded-md py-2.5 px-5 inline-block font-bold border border-buttonBorder"
//           >
//             Sign in to your Workspace
//           </a>
//         </div>
//       </div>

//       <div className="text-center py-0 text-base leading-6 font-sans text-text">
//         If you did not request this email you can safely ignore it.
//       </div>
//     </div>
//   );
// };

import {
  Tailwind,
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

export const EmailVerificationTemplate = ({url}: emailTypes.iEmailVerificationData) => (
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
      <Preview>Log in with this magic link.</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img src="https://app.glyphx.co/icon" width={48} height={48} alt="Glyphx" />
          <Heading style={heading}>🪄 Your magic link</Heading>
          <Section style={body}>
            <Text style={paragraph}>
              <Link style={link} href={url}>
                👉 Click here to sign in 👈
              </Link>
            </Text>
            <Text style={paragraph}>If you did not request this, please ignore this email.</Text>
          </Section>
          <Text style={paragraph}>
            Best,
            <br />
            Glyphx Team
          </Text>
          <Hr style={hr} />
          <Img
            src="https://app.glyphx.co/icon"
            width={32}
            height={32}
            // style={{
            //   WebkitFilter: 'grayscale(100%)',
            //   filter: 'grayscale(100%)',
            //   margin: '20px 0',
            // }}
          />
          <Text style={footer}>Glyphx Inc.</Text>
        </Container>
      </Body>
    </Html>
  </Tailwind>
);

export default EmailVerificationTemplate;

const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 25px 48px',
  backgroundImage: 'url("/assets/raycast-bg.png")',
  backgroundPosition: 'bottom',
  backgroundRepeat: 'no-repeat, no-repeat',
};

const heading = {
  fontSize: '28px',
  fontWeight: 'bold',
  marginTop: '48px',
};

const body = {
  margin: '24px 0',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '26px',
};

const link = {
  color: '#192033',
};

const hr = {
  borderColor: '#dddddd',
  marginTop: '48px',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  marginLeft: '4px',
};
