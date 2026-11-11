import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { AuthPortal } from '../../components/auth/AuthPortal';
import { AuthProvider } from '../../context/AuthContext';
import { ToastProvider } from '../../components/common/Toast';

describe('AuthPortal Component Tests', () => {
  it('renders AuthPortal in default login mode with all key features', () => {
    const html = renderToString(
      <AuthProvider>
        <ToastProvider>
          <AuthPortal initialMode="login" />
        </ToastProvider>
      </AuthProvider>
    );

    expect(html).toContain('Cổng Luyện Thi');
    expect(html).toContain('Đăng Nhập');
    expect(html).toContain('Đăng Ký Học Sinh');
    expect(html).toContain('Học sinh mẫu');
    expect(html).toContain('Quản trị viên');
    expect(html).toContain('Ghi nhớ tài khoản');
    expect(html).toContain('Tên đăng nhập');
    expect(html).toContain('Mật khẩu / Mã PIN');
  });

  it('renders AuthPortal in register mode with persona selector and security fields', () => {
    const html = renderToString(
      <AuthProvider>
        <ToastProvider>
          <AuthPortal initialMode="register" />
        </ToastProvider>
      </AuthProvider>
    );

    expect(html).toContain('Tạo Tài Khoản Mới');
    expect(html).toContain('Chọn Biểu Tượng Học Sinh (Persona)');
    expect(html).toContain('Phi hành gia');
    expect(html).toContain('Cú thông thái');
    expect(html).toContain('Siêu tốc độ');
    expect(html).toContain('Sư tử dũng cảm');
    expect(html).toContain('Họ và Tên học sinh');
    expect(html).toContain('Nhập lại mật khẩu');
    expect(html).toContain('Học sinh Lớp 8');
  });
});
