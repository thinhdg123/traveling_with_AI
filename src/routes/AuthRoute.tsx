'use client';

import { Suspense } from 'react';
import LoginPage from '../app/auth/page';

const AuthRoute = () => {
  return (
    <Suspense fallback={<div>Loading authentication...</div>}>
      <LoginPage />
    </Suspense>
  );
};

export default AuthRoute;
