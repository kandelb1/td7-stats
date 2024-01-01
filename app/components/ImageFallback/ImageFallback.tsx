'use client'
import Image from "next/image";
import { useState } from "react";

interface IProps {
  src: string;
  width: number;
  height: number;
  alt: string;
  fallbackSrc: string;
}

export default function ImageFallback(props: IProps) {
  const [error, setError] = useState(false);

  return (
    <Image
      src={error ? props.fallbackSrc : props.src}
      width={props.width}
      height={props.height}
      alt={props.alt}
      onError={(e) => {setError(true)}}
    />
  );
}