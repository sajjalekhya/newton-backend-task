create database movies;
use movies;

#CREATE TABLE IF booking_details
(
    booking_det_id serial,
    booking_id integer,
    seat_no integer,
    is_deleted boolean
)

#CREATE TABLE bookings
(
    booking_id integer serial,
    movie_id integer,
    creation_date date,
    user_id integer,
    is_deleted boolean,
    show_id integer,
    deletion_date date,
    modified_date date,
    show_date date,
    no_of_seats integer
)

#CREATE TABLE IF NOT EXISTS movies_list
(
    movie_id serial,
    movie_name character varying COLLATE pg_catalog."default",
    from_date date,
    to_date date,
    creation_date date,
    created_by integer,
    max_seats integer,
    ticket_price double precision,
    is_deleted boolean
)

#CREATE TABLE IF NOT EXISTS roles
(
    role_id integer serial,
    role_name character varying,
    creation_date date
)

#INSERT INTO roles(role_name,creation_date) VALUES('Admin', current_date::date),('User', current_date::date);

#CREATE TABLE IF NOT EXISTS shows_list
(
    show_id integer serial,
    movie_id integer,
    show_time time without time zone,
    is_deleted boolean
)

#CREATE TABLE users
(
    name character varying,
    creation_date date NOT NULL DEFAULT CURRENT_TIMESTAMP,
    mail_id character varying NOT NULL,
    password character varying NOT NULL,
    role_id integer NOT NULL,
    user_id serial
)

#insert into users(name, creation_date, mail_id, password, role_id) values
('Admin',current_date::date,'admin@newtonmovies.com',88888888,1)

#CREATE OR REPLACE FUNCTION public.fnc_get_all_bookings_by_user_id(
	userid integer)
    RETURNS TABLE(data jsonb) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$

BEGIN

RETURN QUERY
SELECT JSONB_AGG(foo) as data from (
	
	select 
		bk.booking_id as "bookingId",
		bk.creation_date as "bookingDate",
		bk.show_date as "showDate",
		u.name as "customerName",
		mv.movie_name as "movieTitle",
		sh.show_time as "showTime",
		mv.ticket_price as "ticketPrice",
		case when bk.is_deleted is true then 'Cancelled' else 'Booked' end as "status",
		(select json_agg(s1) from 
			(select 
				seat_no as "seatNo" from booking_details bkd where bkd.booking_id = bk.booking_id)
		s1) as "seatsBooked"

	from bookings bk
	inner join users u on u.user_id = bk.user_id
	inner join movies_list mv on mv.movie_id = bk.movie_id
	inner join shows_list sh on sh.show_id = bk.show_id
		where bk.user_id = userid
)foo; 
END;
$BODY$;



#CREATE OR REPLACE FUNCTION public.fnc_get_analytics_based_on_profits(
	fromdate date,
	todate date,
	movieid integer)
    RETURNS TABLE(data jsonb) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$

DECLARE
_ticket_price numeric;

BEGIN

select ticket_price into _ticket_price from movies_list where movie_id = movieid;

update bookings
	set no_of_seats = (select count(booking_det_id) from booking_details where booking_details.booking_id = bookings.booking_id)
where no_of_seats is null;

RETURN QUERY
SELECT JSONB_AGG(foo) as data from (
	
	SELECT 
		EXTRACT('YEAR' FROM show_date) as "year",
		EXTRACT('MONTH' FROM show_date) AS "month",
		TO_CHAR(TO_DATE (EXTRACT('MONTH' FROM show_date)::text, 'MM'), 'Month') as "month",
		(sum(no_of_seats) * _ticket_price) as "summaryProfit"
	FROM bookings 
	where movie_id = movieid and is_deleted = false and show_date >= fromdate and show_date <= todate
	GROUP BY EXTRACT('YEAR' FROM show_date),EXTRACT('MONTH' FROM show_date)

)foo; 
END;
$BODY$;



#CREATE OR REPLACE FUNCTION public.fnc_get_analytics_based_on_visits(
	fromdate date,
	todate date,
	movieid integer)
    RETURNS TABLE(data jsonb) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$

DECLARE
_ticket_price numeric;

BEGIN

select ticket_price into _ticket_price from movies_list where movie_id = movieid;

update bookings
	set no_of_seats = (select count(booking_det_id) from booking_details where booking_details.booking_id = bookings.booking_id)
where no_of_seats is null;

RETURN QUERY
SELECT JSONB_AGG(foo) as data from (
	
	SELECT 
		EXTRACT('YEAR' FROM show_date) as "year",
		EXTRACT('MONTH' FROM show_date) AS "month",
		TO_CHAR(TO_DATE (EXTRACT('MONTH' FROM show_date)::text, 'MM'), 'Month') as "month",
		sum(no_of_seats) as "summaryVisits"
	FROM bookings 
	where movie_id = movieid and is_deleted = false and show_date >= fromdate and show_date <= todate
	GROUP BY EXTRACT('YEAR' FROM show_date),EXTRACT('MONTH' FROM show_date)

)foo; 
END;
$BODY$;




#CREATE OR REPLACE FUNCTION public.fnc_get_available_seats_list_by_show_id(
	_show_id integer,
	rec_date date)
    RETURNS TABLE(data jsonb) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$

DECLARE
_max_seat integer;

BEGIN
CREATE TEMP TABLE seats(
	seat_no integer
);

select max_seats into _max_seat from movies_list where movie_id = (select movie_id from shows_list where show_id = _show_id);
insert into seats (select * from generate_series(1,_max_seat));

RETURN QUERY
SELECT JSONB_AGG(foo) as data from (
	
	 select 
		st.seat_no as "seatNo",
		case when bkd.seat_no is null then true else false end as "isAvailable"
		
	from seats st
	left join bookings bk on (bk.show_id = _show_id and bk.is_deleted = false and bk.show_date = rec_date::date)
	left join booking_details bkd on (bk.booking_id = bkd.booking_id)
)foo; 

drop table seats;
END;
$BODY$;



#CREATE OR REPLACE FUNCTION public.fnc_get_movies_list(
	rec_date date)
    RETURNS TABLE(data jsonb) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$

BEGIN

RETURN QUERY
SELECT JSONB_AGG(foo) as data from (
	
	SELECT 
		movie_id as "movieId", 
		movie_name as "movieTitle" 
	from movies_list 
	where from_date <= rec_date::date and to_date >= rec_date::date 
		and is_deleted = false
)foo; 
END;
$BODY$;


#CREATE OR REPLACE FUNCTION public.fnc_get_movies_list_for_deletion(
	)
    RETURNS TABLE(data jsonb) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$

BEGIN

RETURN QUERY
SELECT JSONB_AGG(foo) as data from (
	
	SELECT 
		movie_id as "movieId", 
		movie_name as "movieTitle",
		(select count(booking_id) from bookings where bookings.movie_id = movies_list.movie_id and is_deleted = false and show_date >= current_date::date)
			as "futureBookings"
	from movies_list 
	
)foo; 
END;
$BODY$;



#CREATE OR REPLACE FUNCTION public.fnc_get_shows_list_by_movie_id(
	_movie_id integer)
    RETURNS TABLE(data jsonb) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$

BEGIN

RETURN QUERY
SELECT JSONB_AGG(foo) as data from (
	
	SELECT 
		show_id as "showId", 
		show_time as "showTime"
	from shows_list 
	where  is_deleted = false and movie_id = _movie_id
)foo; 
END;
$BODY$;



#CREATE OR REPLACE PROCEDURE public.sp_additional_seats_to_booking_by_id(
	IN reqobj jsonb,
	IN _booking_id integer)
LANGUAGE 'plpgsql'
AS $BODY$

DECLARE
seatNo text;
_show_time time;
time_diff numeric;
_show_date date;

BEGIN

	select show_date into _show_date from bookings where booking_id = _booking_id;
	select show_time into _show_time from shows_list where show_id = (select show_id from bookings where booking_id = _booking_id);
	
	if _show_date::date = current_date::date then
		select EXTRACT(EPOCH FROM (_show_time::time - current_time::time))/60 into time_diff;
		if time_diff <= 30 then
			raise exception 'Time limit exception'
			using hint = 'Booking can`t be cancelled before 30 minuntes of the show time';
		end if;
	end if;
	
	FOR seatNo IN SELECT * FROM json_array_elements((reqObj->>'selectedSeats')::json)
		LOOP
			INSERT INTO public.booking_details(
				booking_id, seat_no, is_deleted)
			VALUES (
				_booking_id, seatNo::integer, false);
		END LOOP;
	
END;
$BODY$;




#CREATE OR REPLACE PROCEDURE public.sp_cancel_booking_by_id(
	IN _booking_id integer)
LANGUAGE 'plpgsql'
AS $BODY$

DECLARE
_show_time time;
time_diff numeric;
_show_date date;

BEGIN

	select show_date into _show_date from bookings where booking_id = _booking_id;
	select show_time into _show_time from shows_list where show_id = (select show_id from bookings where booking_id = _booking_id);
	
	if _show_date::date = current_date::date then
		select EXTRACT(EPOCH FROM (_show_time::time - current_time::time))/60 into time_diff;
		if time_diff <= 30 then
			raise exception 'Time limit exception'
			using hint = 'Booking can`t be cancelled before 30 minuntes of the show time';
		end if;
	end if;
	update bookings set is_deleted = true, deletion_date = current_date::date where booking_id = _booking_id;
	update booking_details set is_deleted = true where booking_id = _booking_id;		
END;
$BODY$;




#CREATE OR REPLACE PROCEDURE public.sp_create_new_booking(
	IN reqobj jsonb,
	IN userid integer)
LANGUAGE 'plpgsql'
AS $BODY$

DECLARE 
_booking_id integer;
seatNo text;
time_diff numeric;
_show_time time;
	
BEGIN

	select show_time into _show_time from shows_list where show_id = (reqobj->>'showId')::integer;
	if (reqobj->>'showDate')::date = current_date::date then
		select EXTRACT(EPOCH FROM (_show_time::time - current_time::time))/60 into time_diff;
		if time_diff <= 30 then
			raise exception 'Time limit exception'
			using hint = 'Bookings unavailable before 30 minuntes of the show time';
		end if;
	end if;

	INSERT INTO public.bookings(
		movie_id, creation_date, user_id, is_deleted, show_id, show_date)
	VALUES (
		(reqobj->>'movieId')::integer,
		current_date,
		userid,
		'f',
		(reqobj->>'showId')::integer,
		(reqobj->>'showDate')::date
	) returning booking_id into _booking_id;
	
	FOR seatNo IN SELECT * FROM json_array_elements((reqObj->>'selectedSeats')::json)
		LOOP
			INSERT INTO public.booking_details(
				booking_id, seat_no, is_deleted)
			VALUES (
				_booking_id, seatNo::integer, false);
		END LOOP;
		
END;
$BODY$;




#CREATE OR REPLACE PROCEDURE public.sp_create_new_movie(
	IN reqobj jsonb,
	IN userid integer)
LANGUAGE 'plpgsql'
AS $BODY$

DECLARE 
_movie_id integer;
showTime text;
_user_role_id integer;
_admin_role_id integer;
	
BEGIN

	select role_id into _admin_role_id from roles where role_name = 'Admin';
	select role_id into _user_role_id from users where user_id = userid;
	
	if _user_role_id != _admin_role_id then
		raise exception 'Access denied'
		using hint = 'Access denied..Only admin can create a movie!';
	end if;

	INSERT INTO public.movies_list(
	movie_name, from_date, to_date, creation_date, created_by, max_seats, ticket_price, is_deleted)
	VALUES (
		(reqobj->>'movieName'),
		(reqobj->>'fromDate')::date,
		(reqobj->>'toDate')::date,
		current_date,
		userid,
		(reqobj->>'maxSeats')::integer,
		(reqobj->>'ticketPrice')::double precision,
		false
	) returning movie_id into _movie_id;
	
	FOR showTime IN SELECT * FROM json_array_elements((reqObj->>'showTimings')::json)
		LOOP
			INSERT INTO public.shows_list(
				movie_id, show_time, is_deleted)
				VALUES (_movie_id, showTime::time, false);
		END LOOP;
		
END;
$BODY$;




#CREATE OR REPLACE PROCEDURE public.sp_delete_movie_by_id(
	IN movieid integer,
	IN userid integer)
LANGUAGE 'plpgsql'
AS $BODY$

declare
_user_role_id integer;
_admin_role_id integer;

BEGIN
	select role_id into _admin_role_id from roles where role_name = 'Admin';
	select role_id into _user_role_id from users where user_id = userid;
	
	if _user_role_id != _admin_role_id then
		raise exception 'Access denied'
		using hint = 'Access denied..Only admin can delete a movie!';
	end if;

	update movies_list set is_deleted = true where movie_id = movieid;
	update shows_list set is_deleted = true where movie_id = movieid;
	update bookings set is_deleted = true, deletion_date = current_date::date where movie_id = movieid and show_date >= current_date;
	update booking_details set is_deleted = true where booking_id in (select booking_id from bookings where is_deleted = true);		
END;
$BODY$;


#CREATE OR REPLACE PROCEDURE public.sp_update_booking_by_id(
	IN reqobj jsonb,
	IN _booking_id integer)
LANGUAGE 'plpgsql'
AS $BODY$

DECLARE
seatNo text;
_show_time time;
time_diff numeric;
_show_date date;

BEGIN

	select show_date into _show_date from bookings where booking_id = _booking_id;
	select show_time into _show_time from shows_list where show_id = (select show_id from bookings where booking_id = _booking_id);
	
	if _show_date::date = current_date::date then
		select EXTRACT(EPOCH FROM (_show_time::time - current_time::time))/60 into time_diff;
		if time_diff <= 30 then
			raise exception 'Time limit exception'
			using hint = 'Booking can`t be cancelled before 30 minuntes of the show time';
		end if;
	end if;
	
	FOR seatNo IN SELECT * FROM json_array_elements((reqObj->>'selectedSeats')::json)
		LOOP
			INSERT INTO public.booking_details(
				booking_id, seat_no, is_deleted)
			VALUES (
				_booking_id, seatNo::integer, false);
		END LOOP;
	
END;
$BODY$;