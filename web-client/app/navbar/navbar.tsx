'use client';
import Image from "next/image";
import styles from "./navbar.module.css";
import Link from "next/link";
import SignIn from "./sign-in";
import {  useEffect, useState } from "react";
import { onAuthStateChangedCallback } from "../firebase/firebase";
import { User } from "firebase/auth";
import Upload from "./upload";
// import {useRouter} from "next/router";
export default function Navbar() {
    // const router = useRouter();
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChangedCallback((user) => {
            setUser(user);
        });
        return () => unsubscribe();
    });

    return (
        <nav className={styles.nav}>
            <Link href="/" className={styles.logocontainer}>
                <Image className={styles.logo} src="/media_server.svg" alt="Media Server Logo" width={50} height={50} />
            </Link>
            <h1 className={styles.title}>My Media Server</h1>
            {
                user && <Upload />
            }
            <SignIn user={user} />
        </nav>
    );
}

