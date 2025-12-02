// src/components/SafeImage.jsx
import React, { useState, useEffect } from "react";

/**
 * SafeImage
 * Props:
 *  - src: string (required) initial image URL
 *  - alt: string
 *  - className: string (optional)
 *  - fallback: string (optional) - URL for final fallback
 *
 * Behavior:
 *  - tries src
 *  - on error, retries with version removed (cloudinary /v123/)
 *  - on second failure, uses fallback (or default placeholder)
 *  - logs failures to console (replace with Sentry/reporting if you want)
 */

const DEFAULT_FALLBACK = "/images/event-placeholder.png"; // put placeholder in public/images

function stripCloudinaryVersion(url) {
  try {
    // replace first occurrence of /v<number>/ with /
    return url.replace(/\/v\d+\//, "/");
  } catch {
    return url;
  }
}

export default function SafeImage({ src, alt = "", className = "", fallback = DEFAULT_FALLBACK }) {
  const [current, setCurrent] = useState(src);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    // reset when src changes
    setCurrent(src);
    setAttempt(0);
  }, [src]);

  const handleError = (e) => {
    const failedUrl = e?.target?.src ?? current;
    // First retry: strip cloudinary version
    if (attempt === 0) {
      const noVersion = stripCloudinaryVersion(failedUrl);
      if (noVersion && noVersion !== failedUrl) {
        setAttempt(1);
        setCurrent(noVersion);
        console.warn("[SafeImage] retrying without version:", noVersion);
        return;
      }
    }

    // Final fallback
    if (attempt < 2) {
      setAttempt(2);
      setCurrent(fallback);
    } else {
      // Already fallback, nothing more to do
      console.error("[SafeImage] failed to load image:", failedUrl);
    }
  };

  return <img src={current} alt={alt} onError={handleError} className={className} />;
}
