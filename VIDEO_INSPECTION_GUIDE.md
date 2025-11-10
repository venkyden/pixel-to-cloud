# Property Video Inspection Feature

## Overview
Tenants can now record or upload videos to document property conditions during check-in and check-out. This provides evidence for security deposit claims and dispute resolution.

## Features Implemented

### 1. Video Storage
- **Supabase Storage Bucket**: `property-videos`
- **File Size Limit**: 100MB per video
- **Supported Formats**: MP4, MOV, AVI, WebM
- **Security**: Private bucket with RLS policies

### 2. Recording Options
**Option A: Record with Camera**
- Click "Record Video" to start camera
- Records directly in browser (video + audio)
- Preview shown while recording
- Click "Stop Recording" when done
- Format: WebM (browser standard)

**Option B: Upload Pre-recorded**
- Click "Upload Video" 
- Select video file from device
- Supports common video formats
- Automatic size validation

### 3. Inspection Types
- **Check-in**: Document property condition when moving in
- **Check-out**: Document property condition when moving out

### 4. Property Inspections Table
Database table to track all inspections:
- Property ID
- User ID (tenant/landlord)
- Inspection type (check-in/check-out)
- Video URL
- Notes
- Timestamp

### 5. RLS Security Policies
✅ Users can only upload videos to their own folder
✅ Users can view their own videos
✅ Property owners can view videos for their properties
✅ Users can delete their own videos

## How to Use

### For Tenants

**When Moving In (Check-in)**
1. Go to Dashboard → Inspections tab
2. Select your property
3. Choose "Check-in (Moving In)"
4. Either:
   - Click "Record Video" to use your camera
   - Click "Upload Video" to select existing file
5. Add notes about any pre-existing damages
6. Click "Submit Inspection"

**When Moving Out (Check-out)**
1. Go to Dashboard → Inspections tab
2. Select the property
3. Choose "Check-out (Moving Out)"
4. Record/upload video showing property condition
5. Add notes about any repairs made or issues
6. Click "Submit Inspection"

### For Property Owners

**Viewing Inspections**
1. Go to Dashboard → Inspections tab
2. See all inspections for your properties
3. Click Play button to watch videos
4. Review notes from tenant
5. Use for security deposit decisions

## Video Recording Tips

### What to Include in Check-in Video
- Walk through each room systematically
- Focus on existing damages:
  - Wall marks, scratches, stains
  - Broken fixtures or appliances
  - Carpet stains or damage
  - Window/door issues
- Film appliance conditions
- Document cleanliness level
- Show all rooms including closets

### What to Include in Check-out Video
- Show the same areas as check-in
- Demonstrate repairs or cleaning done
- Highlight any new damages (be honest)
- Show appliances working
- Document cleanliness
- Film entire property systematically

### Recording Best Practices
- Use good lighting
- Hold phone steady or use tripod
- Speak clearly when describing items
- Take your time - don't rush
- Aim for 5-15 minutes total
- Keep file under 100MB

## Database Schema

### property_inspections Table
```sql
- id: UUID (primary key)
- property_id: UUID (references properties)
- user_id: UUID (references auth.users)
- type: TEXT ('check-in' or 'check-out')
- video_url: TEXT (storage URL)
- notes: TEXT (optional observations)
- created_at: TIMESTAMPTZ
```

### Storage Structure
```
property-videos/
  └── {user_id}/
      └── {property_id}/
          ├── {timestamp}-video.mp4
          ├── {timestamp}-video.webm
          └── ...
```

## Legal & Dispute Benefits

### For Tenants
- **Proof of Initial Condition**: Shows property wasn't damaged by you
- **Security Deposit Protection**: Evidence for getting deposit back
- **Dispute Resolution**: Clear documentation if disagreements arise
- **Peace of Mind**: Know you have evidence

### For Landlords
- **Damage Assessment**: Clear before/after comparison
- **Fair Deposit Deductions**: Justified reasons for keeping deposits
- **Reduced Disputes**: Visual evidence reduces arguments
- **Documentation**: Required for insurance/legal claims

## Privacy & Security

### Who Can See Videos?
- ✅ Tenant who uploaded (always)
- ✅ Property owner (for their properties only)
- ❌ Other tenants (never)
- ❌ Public (never)

### Data Retention
- Videos stored indefinitely by default
- Users can delete their own videos
- Property owners cannot delete tenant videos
- Recommended to keep for 1 year after lease ends

### GDPR Compliance
- Videos contain personal data
- Users can request deletion
- Access restricted by RLS policies
- Secure storage with encryption

## Technical Details

### Browser Requirements
- **Camera Recording**: Requires camera permissions
- **Supported Browsers**: 
  - Chrome/Edge (recommended)
  - Firefox
  - Safari (limited)
- **Mobile**: Works on iOS Safari and Android Chrome

### File Size Management
- Max upload: 100MB
- Typical 10-min video: 50-80MB
- Camera recording: ~5-10MB/minute
- Compression happens automatically

### Performance
- Upload speed depends on internet
- Large files may take 1-5 minutes
- Progress indicator shown
- Can continue using app during upload

## Troubleshooting

### Camera Not Working
- Check browser permissions
- Grant camera access when prompted
- Try refreshing page
- Use upload option instead

### Upload Failed
- Check file size (must be < 100MB)
- Verify internet connection
- Try smaller video
- Check video format is supported

### Video Won't Play
- Click Play button to open in new tab
- May need to download and play locally
- Browser must support video format

## Future Enhancements

Potential additions:
- Photo uploads in addition to video
- Video compression before upload
- Timestamped annotations
- Side-by-side check-in/check-out comparison
- AI damage detection
- Automatic deposit calculation
- Email notifications with video links
- Mobile app with better camera controls

## Support

For issues or questions:
- Check console logs for errors
- Verify storage bucket permissions
- Test with smaller video files first
- Contact platform support if problems persist
