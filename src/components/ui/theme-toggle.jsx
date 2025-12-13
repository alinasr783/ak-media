import React from 'react';
import { Button } from './button';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = ({ className = "", ...props }) => {
  // Simple theme toggle without actual functionality for now
  // Just a placeholder to prevent import errors
  return (
    <Button variant="outline" size="sm" className={className} {...props}>
      <Sun className="h-4 w-4 dark:hidden" />
      <Moon className="h-4 w-4 hidden dark:block" />
      <span className="sr-only">تبديل الوضع</span>
    </Button>
  );
};

export default ThemeToggle;