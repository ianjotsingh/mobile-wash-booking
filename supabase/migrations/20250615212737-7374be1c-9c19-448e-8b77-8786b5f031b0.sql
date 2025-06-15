
-- Function to notify all mechanics within 20km of the mechanic request's location
CREATE OR REPLACE FUNCTION public.notify_nearby_mechanics_on_request()
RETURNS TRIGGER AS $$
DECLARE
    mechanic_record RECORD;
    distance_km DECIMAL;
BEGIN
    -- Only proceed if we have latitude and longitude fields in mechanic_requests and mechanics table.
    -- For now, we'll assume address geocoding is handled in the app, and mechanics table has latitude/longitude.

    FOR mechanic_record IN
        SELECT id, user_id, full_name, phone, latitude, longitude
        FROM mechanics
        WHERE latitude IS NOT NULL AND longitude IS NOT NULL
    LOOP
        -- Calculate distance between mechanic and address of new request.
        -- We'll need latitude and longitude in mechanic_requests for this to work.
        -- If not present, this part will need to be adapted once geocoding is implemented for requests.
        --
        -- For now, this will assume the request table has latitude/longitude columns.
        distance_km := calculate_distance(
            NEW.latitude, NEW.longitude,
            mechanic_record.latitude, mechanic_record.longitude
        );

        IF distance_km <= 20 THEN
            INSERT INTO notifications (
                company_id,
                order_id,
                title,
                message
            )
            VALUES (
                NULL,
                NEW.id,
                'New Mechanic Request Nearby',
                format(
                    'Phone: %s, Address: %s, Problem: %s',
                    NEW.phone,
                    NEW.address,
                    NEW.problem_description
                )
            );
        END IF;
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if it exists
DROP TRIGGER IF EXISTS mechanics_radius_notify_trigger ON mechanic_requests;

-- Create trigger for mechanic_requests inserts
CREATE TRIGGER mechanics_radius_notify_trigger
AFTER INSERT ON mechanic_requests
FOR EACH ROW
EXECUTE FUNCTION public.notify_nearby_mechanics_on_request();
