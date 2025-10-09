import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useLanguage } from "@/hooks/useLanguage";
import { translations } from "@/lib/translations";
import { User } from "lucide-react";

export function MeasurementsProgress() {
  const { language } = useLanguage();
  const t = translations[language];
  const [measurements] = useLocalStorage("measurements", []);

  if (measurements.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t.measurementsProgress}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            {t.noMeasurementsData}
          </div>
        </CardContent>
      </Card>
    );
  }

  const firstMeasurement = measurements[0];
  const latestMeasurement = measurements[measurements.length - 1];

  const getDefaultSilhouette = () => (
    <div className="flex items-center justify-center h-full bg-muted/30 rounded">
      <User className="w-20 h-20 text-muted-foreground" />
    </div>
  );

  const calculateChange = (first: number, latest: number) => {
    const change = latest - first;
    return {
      value: Math.abs(change),
      isDecrease: change < 0,
    };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.measurementsProgress}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Photo comparison */}
        <div>
          <h3 className="text-lg font-semibold mb-4">{t.photoComparison}</h3>
          <div className="grid grid-cols-3 gap-4">
            {/* Front */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-center">{t.frontView}</p>
              <div className="space-y-2">
                <div className="aspect-[3/4] rounded-lg overflow-hidden border">
                  {firstMeasurement.frontPhoto ? (
                    <img src={firstMeasurement.frontPhoto} alt={t.before} className="w-full h-full object-cover" />
                  ) : (
                    getDefaultSilhouette()
                  )}
                </div>
                <p className="text-xs text-center text-muted-foreground">{t.before}</p>
              </div>
              <div className="space-y-2">
                <div className="aspect-[3/4] rounded-lg overflow-hidden border">
                  {latestMeasurement.frontPhoto ? (
                    <img src={latestMeasurement.frontPhoto} alt={t.after} className="w-full h-full object-cover" />
                  ) : (
                    getDefaultSilhouette()
                  )}
                </div>
                <p className="text-xs text-center text-muted-foreground">{t.after}</p>
              </div>
            </div>

            {/* Side */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-center">{t.sideView}</p>
              <div className="space-y-2">
                <div className="aspect-[3/4] rounded-lg overflow-hidden border">
                  {firstMeasurement.sidePhoto ? (
                    <img src={firstMeasurement.sidePhoto} alt={t.before} className="w-full h-full object-cover" />
                  ) : (
                    getDefaultSilhouette()
                  )}
                </div>
                <p className="text-xs text-center text-muted-foreground">{t.before}</p>
              </div>
              <div className="space-y-2">
                <div className="aspect-[3/4] rounded-lg overflow-hidden border">
                  {latestMeasurement.sidePhoto ? (
                    <img src={latestMeasurement.sidePhoto} alt={t.after} className="w-full h-full object-cover" />
                  ) : (
                    getDefaultSilhouette()
                  )}
                </div>
                <p className="text-xs text-center text-muted-foreground">{t.after}</p>
              </div>
            </div>

            {/* Back */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-center">{t.backView}</p>
              <div className="space-y-2">
                <div className="aspect-[3/4] rounded-lg overflow-hidden border">
                  {firstMeasurement.backPhoto ? (
                    <img src={firstMeasurement.backPhoto} alt={t.before} className="w-full h-full object-cover" />
                  ) : (
                    getDefaultSilhouette()
                  )}
                </div>
                <p className="text-xs text-center text-muted-foreground">{t.before}</p>
              </div>
              <div className="space-y-2">
                <div className="aspect-[3/4] rounded-lg overflow-hidden border">
                  {latestMeasurement.backPhoto ? (
                    <img src={latestMeasurement.backPhoto} alt={t.after} className="w-full h-full object-cover" />
                  ) : (
                    getDefaultSilhouette()
                  )}
                </div>
                <p className="text-xs text-center text-muted-foreground">{t.after}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Measurements comparison */}
        <div>
          <h3 className="text-lg font-semibold mb-4">{t.bodyMeasurements}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Neck */}
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">{t.neck}</p>
              <div className="space-y-1">
                <p className="text-lg font-semibold">{latestMeasurement.neck} {t.cm}</p>
                {(() => {
                  const { value, isDecrease } = calculateChange(firstMeasurement.neck, latestMeasurement.neck);
                  return value > 0 ? (
                    <p className={`text-xs ${isDecrease ? 'text-medical-success' : 'text-medical-warning'}`}>
                      {isDecrease ? '↓' : '↑'} {value.toFixed(1)} {t.cm}
                    </p>
                  ) : null;
                })()}
              </div>
            </div>

            {/* Shoulders */}
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">{t.shoulders}</p>
              <div className="space-y-1">
                <p className="text-lg font-semibold">{latestMeasurement.shoulders} {t.cm}</p>
                {(() => {
                  const { value, isDecrease } = calculateChange(firstMeasurement.shoulders, latestMeasurement.shoulders);
                  return value > 0 ? (
                    <p className={`text-xs ${isDecrease ? 'text-medical-success' : 'text-medical-warning'}`}>
                      {isDecrease ? '↓' : '↑'} {value.toFixed(1)} {t.cm}
                    </p>
                  ) : null;
                })()}
              </div>
            </div>

            {/* Waist */}
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">{t.waist}</p>
              <div className="space-y-1">
                <p className="text-lg font-semibold">{latestMeasurement.waist} {t.cm}</p>
                {(() => {
                  const { value, isDecrease } = calculateChange(firstMeasurement.waist, latestMeasurement.waist);
                  return value > 0 ? (
                    <p className={`text-xs ${isDecrease ? 'text-medical-success' : 'text-medical-warning'}`}>
                      {isDecrease ? '↓' : '↑'} {value.toFixed(1)} {t.cm}
                    </p>
                  ) : null;
                })()}
              </div>
            </div>

            {/* Hips */}
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">{t.hips}</p>
              <div className="space-y-1">
                <p className="text-lg font-semibold">{latestMeasurement.hips} {t.cm}</p>
                {(() => {
                  const { value, isDecrease } = calculateChange(firstMeasurement.hips, latestMeasurement.hips);
                  return value > 0 ? (
                    <p className={`text-xs ${isDecrease ? 'text-medical-success' : 'text-medical-warning'}`}>
                      {isDecrease ? '↓' : '↑'} {value.toFixed(1)} {t.cm}
                    </p>
                  ) : null;
                })()}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
