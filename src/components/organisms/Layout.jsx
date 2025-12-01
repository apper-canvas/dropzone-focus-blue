import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAuth } from "@/layouts/Root";
import React from "react";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import DropZone from "@/components/organisms/DropZone";

const Layout = () => {
  const { user, isAuthenticated } = useSelector((state) => state.user);
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-gray-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <ApperIcon name="Upload" className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                DropZone
              </h1>
            </div>

            {/* User Actions */}
            <div className="flex items-center space-x-4">
              {isAuthenticated && user && (
                <>
                  <div className="flex items-center space-x-2 text-sm text-gray-700">
                    <ApperIcon name="User" className="w-4 h-4" />
                    <span>
                      {user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.emailAddress}
                    </span>
                  </div>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <ApperIcon name="LogOut" className="w-4 h-4" />
                    <span>Logout</span>
                  </Button>
                </>
              )}
              {!isAuthenticated && (
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => window.location.href = '/login'}
                    variant="outline"
                    size="sm"
                  >
                    <ApperIcon name="LogIn" className="w-4 h-4 mr-2" />
                    Sign In
                  </Button>
                  <Button
                    onClick={() => window.location.href = '/signup'}
                    variant="primary"
                    size="sm"
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white/60 backdrop-blur-sm border-t border-gray-200/50 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500 text-sm">
            <p>© 2024 DropZone. Secure file uploading made simple.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;