import React from 'react';
import {emailTypes} from 'types';

export const EmailUpdatedTemplate = ({newEmail}: emailTypes.iEmailUpdatedData) => {
  return (
    <div>
      <p>Hello there!</p>
      <p>
        You have requested to update your email address to:<strong>{newEmail}</strong>
      </p>
      <p>Login with your new email address to refresh your session by clicking the link below</p>
      <a href={`${process.env.APP_URL}/login`}>Login</a>
      <p>In case you need any assistance, just hit reply.</p>
      <p>
        Cheers,
        <br />
        The Glyphx Team
      </p>
    </div>
  );
};
