import React, { useState, useEffect } from 'react';
import 'react-loading-skeleton/dist/skeleton.css';
import ContentLoader, {
  Facebook,
  Instagram,
  Code,
  List,
  BulletList,
} from 'react-content-loader';
import Loader from './Loader';

const SkeletonWithLoaders = ({ children }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Show loader for 2 seconds
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <>
      {children}
    </>
  );
};

export default SkeletonWithLoaders;