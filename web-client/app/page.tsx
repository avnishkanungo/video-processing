// import Image from "next/image";
import styles from "./page.module.css";
import { getVideos } from './firebase/functions';
import Image from 'next/image';
import Link from 'next/link';

export default async function Home() {
  const videos = await getVideos();

  console.log(videos);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
      {
        videos.map((video, index) => (
          <div key={video.filename} className={styles.videoContainer}>
          <Link href={`/watch?v=${video.filename}`} key ={video.id}>
            <Image src={'/115777_video_icon.png'} alt={`Video ${index + 1}`}  width={120} height={80}
              className={styles.thumbnail}/>
          </Link>
          <h3 className={styles.videoTitle}>Video {index + 1}</h3>
          </div>
        ))
      }
      </main>
      {/* <footer className={styles.footer}>
        <a
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer> */}
    </div>
  );
}

export const revalidate = 30;
