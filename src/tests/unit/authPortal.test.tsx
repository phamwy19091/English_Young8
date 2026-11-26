import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { AuthPortal } from '../../components/auth/AuthPortal';
import { AuthProvider } from '../../context/AuthContext';
import { ToastProvider } from '../../components/common/Toast';

describe('AuthPortal Component Tests', () => {
  it('renders AuthPortal in default login mode with clean minimal layout', () => {
    const html = renderToString(
      <AuthProvider>
        <ToastProvider>
          <AuthPortal initialMode="login" />
        </ToastProvider>
      </AuthProvider>
    );

    expect(html).toContain('English Young 8');
    expect(html).toContain('Ôn tập &amp; Luyện thi Tiếng Anh lớp 8');
    expect(html).toContain('Đăng nhập');
    expect(html).toContain('Đăng ký');
    expect(html).toContain('Tên đăng nhập hoặc Email');
    expect(html).toContain('Mật khẩu');
    expect(html).toContain('Ghi nhớ tên đăng nhập');
    expect(html).not.toContain('Học sinh mẫu');
    expect(html).not.toContain('Chọn Biểu Tượng Học Sinh');
  });

  it('renders AuthPortal in register mode with essential student fields only', () => {
    const html = renderToString(
      <AuthProvider>
        <ToastProvider>
          <AuthPortal initialMode="register" />
        </ToastProvider>
      </AuthProvider>
    );

    expect(html).toContain('English Young 8');
    expect(html).toContain('Họ và tên');
    expect(html).toContain('Tên đăng nhập');
    expect(html).toContain('Mật khẩu');
    expect(html).toContain('Nhập lại mật khẩu');
    expect(html).toContain('Tạo tài khoản');
    expect(html).not.toContain('Chọn Biểu Tượng Học Sinh');
    expect(html).not.toContain('Học sinh mẫu');
  });
});
