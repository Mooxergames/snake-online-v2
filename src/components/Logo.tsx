import Image from 'next/image';

export default function Logo({ className = '' }: { className?: string }) {
  return (
    <Image
      src="/snake-logo.png"
      alt="Snake Online"
      width={267}
      height={111}
      className={className}
      priority
    />
  );
}
