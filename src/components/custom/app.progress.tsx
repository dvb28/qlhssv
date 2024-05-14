'use client';
import React from 'react';
import { AppProgressBar as ProgressBar } from 'next-nprogress-bar';

export default function AppProgress() {
  // Return
  return (
    <ProgressBar
      height="4px"
      color="#1677FF"
      options={{ showSpinner: true }}
      shallowRouting
    />
  );
}
