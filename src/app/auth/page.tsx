'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { auth } from "../../../firebase/clientApp"
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth"
import { validateLoginForm, validateRegisterForm, extractFormData } from "../../utils/authInputValidation"
import { LoginFormData, RegisterFormData } from "../../types/AuthType"
import { AuthGuard } from '@/components/AuthGuard';
import { Roboto } from 'next/font/google'

const roboto = Roboto({ subsets: ['latin'], weight: ['400', '500', '700'] })

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const formData = extractFormData(form);

    let errors;

    if (isSignUp) {
      // Registration form validation
      const registerData = formData as RegisterFormData & { confirmPassword?: string };
      errors = validateRegisterForm(registerData);
    } else {
      // Login form validation
      const loginData = formData as LoginFormData;
      errors = validateLoginForm(loginData);
    }

    if (errors.length > 0) {
      // Display validation errors
      errors.forEach(error => {
        toast.error(error.message);
      });
      return;
    }

    // If validation passes, proceed with Firebase authentication
    try {
      if (isSignUp) {
        // Registration logic
        const registerData = formData as RegisterFormData & { confirmPassword?: string };
        console.log('Registering user with Firebase...');

        const userCredential = await createUserWithEmailAndPassword(
          auth,
          registerData.email,
          registerData.password
        );

        console.log('Registration successful:', userCredential.user);
        toast.success('Đăng ký thành công!');
        // Navigate to home page after successful registration
        router.push('/home');

      } else {
        // Login logic
        const loginData = formData as LoginFormData;
        console.log('Logging in user with Firebase...');

        const userCredential = await signInWithEmailAndPassword(
          auth,
          loginData.email,
          loginData.password
        );

        console.log('Login successful:', userCredential.user);
        toast.success('Đăng nhập thành công!');
        // Navigate to home page after successful login
        router.push('/home');
      }
    } catch (error: unknown) {
      console.error('Authentication error:', error);

      // Handle specific Firebase auth errors
      let errorMessage = 'Đã xảy ra lỗi. Vui lòng thử lại!';
      const firebaseError = error as { code?: string };

      if (firebaseError.code === 'auth/email-already-in-use') {
        errorMessage = 'Email đã được đăng ký';
      } else if (firebaseError.code === 'auth/invalid-credential') {
        errorMessage = 'Bạn chưa đăng ký tài khoản';
      } else if (firebaseError.code === 'auth/invalid-email') {
        errorMessage = 'Email không hợp lệ!';
      } else if (firebaseError.code === 'auth/operation-not-allowed') {
        errorMessage = 'Đăng nhập bằng email/mật khẩu không được phép!';
      } else if (firebaseError.code === 'auth/weak-password') {
        errorMessage = 'Mật khẩu quá yếu!';
      } else if (firebaseError.code === 'auth/user-disabled') {
        errorMessage = 'Tài khoản đã bị vô hiệu hóa!';
      } else if (firebaseError.code === 'auth/user-not-found') {
        errorMessage = 'Không tìm thấy tài khoản với email này!';
      } else if (firebaseError.code === 'auth/wrong-password') {
        errorMessage = 'Mật khẩu không đúng!';
      } else if (firebaseError.code === 'auth/too-many-requests') {
        errorMessage = 'Quá nhiều lần thử. Vui lòng thử lại sau!';
      }

      toast.error(errorMessage);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log('Google sign-in successful:', user);
      toast.success('Đăng nhập với Google thành công!');
      // Navigate to home page after successful Google sign-in
      router.push('/home');
    } catch (error: unknown) {
      console.error('Google sign-in error:', error);
      // Show error toast notification
      let errorMessage = '';
      const firebaseError = error as { code?: string };

      if (firebaseError.code === 'auth/cancelled-popup-request') {
        // User closed the popup, don't show an error
        return;
      } else if (firebaseError.code === 'auth/popup-closed-by-user') {
        // User closed the popup, don't show an error
        return;
      } else if (firebaseError.code === 'auth/popup-blocked') {
        errorMessage = 'Popup bị chặn. Vui lòng cho phép popup và thử lại!';
      } else {
        errorMessage = 'Đăng nhập bằng Google thất bại. Vui lòng thử lại!';
      }

      if (errorMessage) {
        toast.error(errorMessage);
      }
    }
  };

  return (
    <AuthGuard requireAuth={false}>
      <div className={roboto.className} style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundImage: 'url("/images/background_auth.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        width: '100vw'
      }}>
        <div>
          <img src="/images/logo_travelpal.png" alt="Logo" style={{ width: '300px', display: 'block', margin: '0 auto', position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)' }} />
        </div>
        <div className="wrapper">
          <div className="card-switch">
            <label className="switch">
              <input
                type="checkbox"
                className="toggle"
                checked={isSignUp}
                onChange={(e) => setIsSignUp(e.target.checked)}
              />
              <span className="slider"></span>
              <span className="card-side"></span>
              <div className="flip-card__inner">
                <div className="flip-card__front">
                  <div style={{ position: 'relative' }}>
                    <img
                      src="/images/man_with_flag.png"
                      alt="Man with flag"
                      style={{
                        position: 'absolute',
                        right: '-230px',
                        top: '-50px',
                        width: '250px',
                        zIndex: 1
                      }}
                    />
                    <img
                      src="/images/woman.png"
                      alt="Woman"
                      style={{
                        position: 'absolute',
                        left: '-102px',
                        top: '-50px',
                        width: '120px',
                        zIndex: 1
                      }}
                    />
                  </div>
                  <div className="title">Đăng nhập</div>
                  <form className="flip-card__form" onSubmit={handleSubmit}>
                    <input
                      className="flip-card__input"
                      name="email"
                      placeholder="Email"
                      type="email"
                    />
                    <input
                      className="flip-card__input"
                      name="password"
                      placeholder="Mật khẩu"
                      type="password"
                    />
                    <button className="flip-card__btn" type="submit">
                      Đăng nhập
                    </button>
                    <button className="flip-card__btn_google flex items-center justify-center transition-transform duration-200 hover:scale-102" type="button" onClick={handleGoogleSignIn}>
                      <img src="/images/google_logo.svg" alt="Google" style={{ width: '20px', height: '20px', marginRight: '8px' }} />
                      Đăng nhập với Google
                    </button>
                  </form>
                </div>
                <div className="flip-card__back">
                  <div className="title">Đăng ký</div>
                  <form className="flip-card__form" onSubmit={handleSubmit}>
                    <input
                      className="flip-card__input"
                      name="email"
                      placeholder="Email"
                      type="email"
                    />
                    <input
                      className="flip-card__input"
                      name="password"
                      placeholder="Mật khẩu"
                      type="password"
                    />
                    <input
                      className="flip-card__input"
                      name="confirmPassword"
                      placeholder="Nhập lại mật khẩu"
                      type="password"
                    />
                    <button className="flip-card__btn" type="submit">
                      Xác nhận
                    </button>
                    <button className="flip-card__btn_google flex items-center justify-center" type="button" onClick={handleGoogleSignIn}>
                      <img src="/images/google_logo.svg" alt="Google" style={{ width: '20px', height: '20px', marginRight: '8px' }} />
                      Đăng ký với Google
                    </button>
                  </form>
                </div>
              </div>
            </label>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}