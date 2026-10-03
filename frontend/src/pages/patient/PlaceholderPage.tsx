import { ArrowLeft, Construction } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

interface PlaceholderPageProps {
  title: string;
  subtitle: string;
  partTag: string;
  icon: LucideIcon;
  description: string;
  onBackToDashboard: () => void;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({
  title,
  subtitle,
  partTag,
  icon: Icon,
  description,
  onBackToDashboard,
}) => {
  return (
    <div className="py-8 sm:py-12 max-w-3xl mx-auto px-4">
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          onClick={onBackToDashboard}
          className="text-slate-600 hover:text-slate-900"
        >
          Back to Dashboard
        </Button>
      </div>

      <Card className="text-center py-12 px-6 sm:px-12 bg-white">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 mx-auto mb-5">
          <Icon className="w-8 h-8" />
        </div>

        <div className="inline-flex items-center gap-1.5 mb-3">
          <Badge variant="teal" size="sm" icon={<Construction className="w-3.5 h-3.5" />}>
            {partTag}
          </Badge>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
          {title}
        </h1>

        <p className="text-sm sm:text-base text-slate-600 font-medium mb-4 max-w-md mx-auto">
          {subtitle}
        </p>

        <p className="text-xs sm:text-sm text-slate-500 mb-8 max-w-lg mx-auto leading-relaxed">
          {description}
        </p>

        <div className="flex justify-center">
          <Button
            variant="primary"
            size="md"
            onClick={onBackToDashboard}
          >
            Return to Dashboard
          </Button>
        </div>
      </Card>
    </div>
  );
};
