'use client';

import { useRef, useState } from 'react';
import { CATEGORY_LIST, type PriceRange, type PopupStatusDb } from '@whats-poppin/shared';
import { Button } from '@/components/Button';
import { FilterChip } from '@/components/Chip';
import { Alert, FormCard, Segmented, SelectField, TextArea, TextField, formStyles } from '@/components/Form';
import { Icon, isIconName } from '@/components/Icon';
import { useI18n } from '@/lib/i18n-client';
import {
  savePopupForm,
  uploadPopupImage,
  validatePopupForm,
  type City,
  type FormErrors,
  type PopupFormValues,
  type TriState,
} from '@/lib/popup-editor';
import styles from './PopupForm.module.css';

interface PopupFormProps {
  initial: PopupFormValues;
  cities: City[];
  mode: 'organizer' | 'admin';
  organizerId?: string | null;
  onSaved: (result: { id: string; slug: string }) => void;
}

const MAX_IMAGES = 6;

/** One page, five short sections, big controls. Used by businesses and by the admin panel. */
export function PopupForm({ initial, cities, mode, organizerId, onSaved }: PopupFormProps) {
  const { t, tList, city: cityName } = useI18n();
  const [v, setV] = useState<PopupFormValues>(initial);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [geo, setGeo] = useState<'idle' | 'finding' | 'notFound'>('idle');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const weekdays = tList('weekdays');

  const set = <K extends keyof PopupFormValues>(key: K, value: PopupFormValues[K]) => {
    setV((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const findAddress = async () => {
    const city = cities.find((c) => c.slug === v.city_slug);
    const q = [v.address.trim(), city?.name_he].filter(Boolean).join(', ');
    if (!v.address.trim()) return;
    setGeo('finding');
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}&country=${city?.country_code ?? 'IL'}`);
      if (!res.ok) throw new Error();
      const hit = (await res.json()) as { lat: number; lng: number; label: string };
      setV((prev) => ({ ...prev, lat: hit.lat, lng: hit.lng, geocoded_label: hit.label }));
      setErrors((e) => ({ ...e, address: undefined }));
      setGeo('idle');
    } catch {
      setGeo('notFound');
    }
  };

  const addImages = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    setUploadError(false);
    const room = MAX_IMAGES - v.images.length;
    for (const file of Array.from(files).slice(0, room)) {
      try {
        const img = await uploadPopupImage(file);
        setV((prev) => ({ ...prev, images: [...prev.images, img] }));
      } catch {
        setUploadError(true);
      }
    }
    setUploading(false);
    if (fileInput.current) fileInput.current.value = '';
  };

  const submit = async () => {
    const found = validatePopupForm(v, t);
    setErrors(found);
    setSaveError(null);
    if (Object.keys(found).length) {
      topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    setSaving(true);
    try {
      onSaved(await savePopupForm(v, { cities, organizerId, asAdmin: mode === 'admin' }));
    } catch (e) {
      setSaveError(t('form.saveFailed', { message: (e as Error).message }));
    } finally {
      setSaving(false);
    }
  };

  const tri = (legend: string, key: 'wheelchair' | 'parking' | 'kids') => (
    <Segmented<TriState>
      legend={legend}
      value={v[key]}
      onChange={(val) => set(key, val)}
      options={[
        { value: 'yes', label: t('form.yes') },
        { value: 'no', label: t('form.no') },
        { value: 'unknown', label: t('form.unknown') },
      ]}
    />
  );

  const hasErrors = Object.values(errors).some(Boolean);

  return (
    <form
      className={styles.form}
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
    >
      <div ref={topRef} />
      {hasErrors ? <Alert tone="error">{t('form.errorTop')}</Alert> : null}

      <FormCard title={t('form.stepBasics')}>
        <TextField label={t('form.title')} hint={t('form.titleHint')} value={v.title} maxLength={80} onChange={(e) => set('title', e.target.value)} error={errors.title} />
        <TextField label={t('form.short')} hint={t('form.shortHint')} value={v.short_description} maxLength={140} optional onChange={(e) => set('short_description', e.target.value)} />
        <fieldset className={formStyles.fieldset} aria-invalid={!!errors.category || undefined}>
          <legend className={formStyles.legend}>{t('form.category')}</legend>
          <div className={styles.chips}>
            {CATEGORY_LIST.map((c) => (
              <FilterChip
                key={c.slug}
                label={t(`categories.${c.slug}`)}
                icon={isIconName(c.icon) ? c.icon : undefined}
                accent={c.color}
                selected={v.category === c.slug}
                onToggle={() => set('category', c.slug)}
              />
            ))}
          </div>
          {errors.category ? <p className={formStyles.error}>{errors.category}</p> : null}
        </fieldset>
        <TextArea label={t('form.description')} value={v.description} optional rows={5} onChange={(e) => set('description', e.target.value)} />
      </FormCard>

      <FormCard title={t('form.stepPlace')}>
        <SelectField label={t('form.city')} value={v.city_slug} onChange={(e) => set('city_slug', e.target.value)} error={errors.city_slug}>
          <option value="">{t('form.chooseCity')}</option>
          {cities.map((c) => (
            <option key={c.slug} value={c.slug}>
              {cityName(c.slug, c.name_he)}
            </option>
          ))}
        </SelectField>
        <TextField
          label={t('form.address')}
          hint={t('form.addressHint')}
          value={v.address}
          onChange={(e) => {
            set('address', e.target.value);
            setV((prev) => ({ ...prev, address: e.target.value, lat: null, lng: null, geocoded_label: '' }));
          }}
          onBlur={() => v.address.trim() && v.lat === null && void findAddress()}
          error={errors.address}
        />
        <Button variant="secondary" icon="map-marker-radius-outline" onClick={() => void findAddress()} loading={geo === 'finding'}>
          {t('form.findAddress')}
        </Button>
        {v.lat !== null && v.geocoded_label ? <Alert tone="ok">{t('form.found', { place: v.geocoded_label })}</Alert> : null}
        {geo === 'notFound' ? <Alert tone="error">{t('form.notFound')}</Alert> : null}
      </FormCard>

      <FormCard title={t('form.stepTime')}>
        <div className={styles.twoCols}>
          <TextField label={t('form.startDate')} type="date" value={v.start_date} onChange={(e) => set('start_date', e.target.value)} error={errors.start_date} />
          <TextField label={t('form.endDate')} type="date" value={v.end_date} min={v.start_date} onChange={(e) => set('end_date', e.target.value)} error={errors.end_date} />
        </div>
        <label className={styles.check}>
          <input type="checkbox" checked={v.all_day} onChange={(e) => set('all_day', e.target.checked)} />
          {t('form.allDay')}
        </label>
        {!v.all_day
          ? v.hours.map((g, gi) => (
              <fieldset key={gi} className={styles.hoursGroup}>
                <legend className={formStyles.legend}>{t('form.hours')}</legend>
                <div className={styles.days} role="group" aria-label={t('form.days')}>
                  {weekdays.map((name, day) => (
                    <button
                      key={day}
                      type="button"
                      aria-pressed={g.days.includes(day)}
                      className={formStyles.segment}
                      onClick={() =>
                        set(
                          'hours',
                          v.hours.map((h, i) =>
                            i !== gi ? h : { ...h, days: h.days.includes(day) ? h.days.filter((d) => d !== day) : [...h.days, day].sort() },
                          ),
                        )
                      }
                    >
                      {name}
                    </button>
                  ))}
                </div>
                <div className={styles.twoCols}>
                  <TextField label={t('form.opens')} type="time" value={g.opens} onChange={(e) => set('hours', v.hours.map((h, i) => (i === gi ? { ...h, opens: e.target.value } : h)))} />
                  <TextField label={t('form.closes')} type="time" value={g.closes} onChange={(e) => set('hours', v.hours.map((h, i) => (i === gi ? { ...h, closes: e.target.value } : h)))} />
                </div>
                {v.hours.length > 1 ? (
                  <Button variant="ghost" size="medium" icon="delete-outline" onClick={() => set('hours', v.hours.filter((_, i) => i !== gi))}>
                    {t('form.removeHours')}
                  </Button>
                ) : null}
              </fieldset>
            ))
          : null}
        {!v.all_day ? (
          <Button variant="ghost" size="medium" icon="plus" onClick={() => set('hours', [...v.hours, { days: [5], opens: '10:00', closes: '14:00' }])}>
            {t('form.addHours')}
          </Button>
        ) : null}
      </FormCard>

      <FormCard title={t('form.stepPhotos')}>
        <p className="t-meta t-secondary">{t('form.photosHint')}</p>
        {v.images.length ? (
          <ul className={styles.photos}>
            {v.images.map((img, i) => (
              <li key={img.url} className={styles.photo}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt="" />
                {i === 0 ? <span className={styles.coverTag}>{t('form.cover')}</span> : null}
                <div className={styles.photoActions}>
                  {i > 0 ? (
                    <button type="button" onClick={() => set('images', [img, ...v.images.filter((_, j) => j !== i)])} aria-label={t('form.makeCover')}>
                      <Icon name="star-four-points-outline" size={20} />
                    </button>
                  ) : null}
                  <button type="button" onClick={() => set('images', v.images.filter((_, j) => j !== i))} aria-label={t('form.removePhoto', { n: i + 1 })}>
                    <Icon name="delete-outline" size={20} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
        <input ref={fileInput} type="file" accept="image/*" multiple hidden onChange={(e) => void addImages(e.target.files)} />
        {v.images.length < MAX_IMAGES ? (
          <Button variant="secondary" icon="image-plus" loading={uploading} onClick={() => fileInput.current?.click()}>
            {uploading ? t('form.uploading') : t('form.addPhotos')}
          </Button>
        ) : null}
        {uploadError ? <Alert tone="error">{t('form.uploadFailed')}</Alert> : null}
      </FormCard>

      <FormCard title={t('form.stepMore')}>
        <Segmented<PriceRange>
          legend={t('form.price')}
          value={v.price_range}
          onChange={(val) => set('price_range', val)}
          options={(['free', 'low', 'medium', 'high'] as const).map((p) => ({ value: p, label: t(`price.${p}`) }))}
        />
        {tri(t('details.wheelchair'), 'wheelchair')}
        {tri(t('details.parking'), 'parking')}
        {tri(t('details.kids'), 'kids')}
        <TextArea label={t('form.accessibilityNotes')} value={v.accessibility_notes} optional rows={2} onChange={(e) => set('accessibility_notes', e.target.value)} />
        <TextField label={t('form.instagram')} type="url" dir="ltr" optional placeholder="https://instagram.com/…" value={v.instagram_url} onChange={(e) => set('instagram_url', e.target.value)} />
        <TextField label={t('form.website')} type="url" dir="ltr" optional placeholder="https://…" value={v.website_url} onChange={(e) => set('website_url', e.target.value)} />
      </FormCard>

      {mode === 'admin' ? (
        <FormCard title={t('form.status')}>
          <Segmented<PopupStatusDb>
            legend={t('form.status')}
            value={v.status}
            onChange={(val) => set('status', val)}
            options={(['approved', 'pending', 'rejected'] as const).map((s) => ({ value: s, label: t(`business.status.${s}`) }))}
          />
          {v.status === 'rejected' ? (
            <TextField label={t('admin.rejectReason')} optional value={v.rejection_reason} onChange={(e) => set('rejection_reason', e.target.value)} />
          ) : null}
        </FormCard>
      ) : null}

      {saveError ? <Alert tone="error">{saveError}</Alert> : null}
      <div className={styles.submitBar}>
        <Button type="submit" icon="check-bold" loading={saving} fullWidth>
          {v.id ? t('form.saveChanges') : mode === 'admin' ? t('form.submitAdmin') : t('form.submit')}
        </Button>
      </div>
    </form>
  );
}
