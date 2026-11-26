-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 26, 2026 at 01:11 PM
-- Server version: 10.11.19-MariaDB
-- PHP Version: 8.5.13

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `tourease_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `accommodations`
--

CREATE TABLE `accommodations` (
  `accommodationId` int(11) NOT NULL,
  `destinationId` int(11) NOT NULL,
  `accommodationName` varchar(150) NOT NULL,
  `address` varchar(255) NOT NULL,
  `contactNumber` varchar(20) NOT NULL,
  `pricePerNight` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `accommodations`
--

INSERT INTO `accommodations` (`accommodationId`, `destinationId`, `accommodationName`, `address`, `contactNumber`, `pricePerNight`) VALUES
(1, 1, 'Ridgeview Garden Inn', 'Aguinaldo Highway, Tagaytay, Cavite', '0464131001', 3200.00),
(2, 2, 'Picnic Grove Suites', 'Santa Rosa-Tagaytay Road, Tagaytay, Cavite', '0464131002', 2800.00),
(3, 3, 'Skyline Tagaytay Hotel', 'Tagaytay-Nasugbu Highway, Tagaytay, Cavite', '0464131003', 4500.00),
(4, 4, 'Taal View Cottage', 'Mahogany Avenue, Tagaytay, Cavite', '0464131004', 3600.00);

-- --------------------------------------------------------

--
-- Table structure for table `destinations`
--

CREATE TABLE `destinations` (
  `destinationId` int(11) NOT NULL,
  `destinationName` varchar(150) NOT NULL,
  `description` text NOT NULL,
  `address` varchar(255) NOT NULL,
  `latitude` decimal(9,6) NOT NULL,
  `longitude` decimal(9,6) NOT NULL,
  `entranceFee` decimal(10,2) NOT NULL DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `destinations`
--

INSERT INTO `destinations` (`destinationId`, `destinationName`, `description`, `address`, `latitude`, `longitude`, `entranceFee`) VALUES
(1, 'People\'s Park in the Sky', 'A hilltop park with a view of Taal Lake.', 'Tagaytay City, Cavite', 14.099600, 120.939500, 50.00),
(2, 'Picnic Grove', 'A lakeside recreation area with picnic spots and walking trails.', 'Picnic Grove Complex, Tagaytay, Cavite', 14.119300, 120.953400, 75.00),
(3, 'Sky Ranch', 'A family amusement park with rides and views of Taal Volcano.', 'Km. 60, Tagaytay-Nasugbu Highway, Tagaytay, Cavite', 14.101800, 120.944700, 100.00),
(4, 'Taal Volcano Viewpoint', 'A popular ridge viewpoint overlooking Taal Lake and Volcano.', 'Tagaytay-Nasugbu Highway, Tagaytay, Cavite', 14.101100, 120.941200, 0.00),
(5, 'Tagaytay Highlands', 'A mountain resort destination with cool-weather scenery.', 'Tagaytay-Calamba Road, Tagaytay, Cavite', 14.087200, 121.012400, 250.00);

-- --------------------------------------------------------

--
-- Table structure for table `itineraries`
--

CREATE TABLE `itineraries` (
  `itineraryId` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `itineraryName` varchar(150) NOT NULL,
  `startDate` date NOT NULL,
  `endDate` date NOT NULL,
  `dateCreated` datetime(6) NOT NULL DEFAULT current_timestamp(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `itineraries`
--

INSERT INTO `itineraries` (`itineraryId`, `userId`, `itineraryName`, `startDate`, `endDate`, `dateCreated`) VALUES
(1, 1, 'Tagaytay Weekend Trip', '2026-12-14', '2026-12-15', '2026-11-25 21:57:13.446098'),
(2, 4, 'Tagaytay Weekend Escape', '2026-11-27', '2026-11-29', '2026-11-25 22:09:44.306569'),
(4, 2, 'Postman Tagaytay Weekend', '2026-12-01', '2026-12-16', '2026-11-25 22:42:18.085548'),
(5, 2, 'Postman Tagaytay Weekend', '2026-12-01', '2026-12-16', '2026-11-25 22:51:42.265921'),
(6, 2, 'Postman Tagaytay Weekend', '2026-12-01', '2026-12-16', '2026-11-25 22:55:32.861367');

-- --------------------------------------------------------

--
-- Table structure for table `itinerary_destinations`
--

CREATE TABLE `itinerary_destinations` (
  `itineraryDestinationId` int(11) NOT NULL,
  `itineraryId` int(11) NOT NULL,
  `destinationId` int(11) NOT NULL,
  `visitDate` date NOT NULL,
  `visitOrder` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `itinerary_destinations`
--

INSERT INTO `itinerary_destinations` (`itineraryDestinationId`, `itineraryId`, `destinationId`, `visitDate`, `visitOrder`) VALUES
(1, 1, 1, '2026-12-14', 1),
(2, 2, 1, '2026-11-27', 1),
(3, 2, 2, '2026-11-28', 2),
(4, 2, 4, '2026-11-29', 3);

-- --------------------------------------------------------

--
-- Table structure for table `tour_guides`
--

CREATE TABLE `tour_guides` (
  `guideId` int(11) NOT NULL,
  `fullName` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phoneNumber` varchar(20) NOT NULL,
  `specialization` varchar(100) NOT NULL,
  `destinationId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tour_guides`
--

INSERT INTO `tour_guides` (`guideId`, `fullName`, `email`, `phoneNumber`, `specialization`, `destinationId`) VALUES
(1, 'Maria Santos', 'maria.guide@tourease.test', '09171234567', 'Nature and viewpoint tours', 1),
(2, 'Jose Reyes', 'jose.guide@tourease.test', '09181234567', 'Family attractions', 3),
(3, 'Ana Cruz', 'ana.guide@tourease.test', '09191234567', 'Local history and food', 2);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `userId` int(11) NOT NULL,
  `fullName` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `passwordHash` varchar(255) NOT NULL,
  `userRole` enum('Tourist','Staff','Guide','Admin') NOT NULL DEFAULT 'Tourist',
  `dateRegistered` datetime(6) NOT NULL DEFAULT current_timestamp(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`userId`, `fullName`, `email`, `passwordHash`, `userRole`, `dateRegistered`) VALUES
(1, 'Prince Bacor', 'princerbacor@gmail.com', '$2b$10$2LloAd4dc1O/lygLaXMoqeDOMwk9RngXKyA6ciehrgaBNAAGdxtdG', 'Admin', '2026-11-25 21:21:23.028274'),
(2, 'TourEase Administrator', 'admin@tourease.test', '$2b$10$DjFOXCxSIamaGmGfbwnIzOBiKYrm.vAeP6v5KHnjVEr8uJybhDm/6', 'Admin', '2026-11-25 22:09:44.186771'),
(3, 'TourEase Staff', 'staff@tourease.test', '$2b$10$Q41/WRyOm3oYwjp25cgQt.voHomcw4gqdS1O4hYIXT71feZTkqg.q', 'Staff', '2026-11-25 22:09:44.240827'),
(4, 'Sample Tourist', 'tourist@tourease.test', '$2b$10$7PglsgzkMLpke4rIr6ZabOxXbgxd/vm.LZ/Zm8rB9fXWa2cNxj.HK', 'Tourist', '2026-11-25 22:09:44.292286'),
(5, 'Taylor Tourist', 'tourist.06644120-b809-417b-820d-a43dffc3aa19@example.test', '$2b$10$S.NLf.lrVNguO7P.wSWG7epz2qPU7rEY01kTx79V5Y02Zncp6.FES', 'Tourist', '2026-11-25 22:26:38.765942'),
(6, 'Taylor Tourist', 'tourist.c36af92a-01ee-4eb1-ae8b-81045fb19fd8@example.test', '$2b$10$Q2kepUsD.t.TfX1PHM33Qe0thqQ36pMdxzp.ZmuVRmul4UvSpiMU6', 'Tourist', '2026-11-25 22:29:17.323627'),
(7, 'Taylor Tourist', 'tourist.db80a215-0ad0-4be5-aeaa-698824c801a8@example.test', '$2b$10$lfsfTn6bXHnW.X4j12D30.sIlZA07pVRYZlpBSrN.K1BuuALna4OO', 'Tourist', '2026-11-25 22:30:16.877173');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `accommodations`
--
ALTER TABLE `accommodations`
  ADD PRIMARY KEY (`accommodationId`),
  ADD KEY `FK_84a902c3a68feb0880d40dc4bcb` (`destinationId`);

--
-- Indexes for table `destinations`
--
ALTER TABLE `destinations`
  ADD PRIMARY KEY (`destinationId`);

--
-- Indexes for table `itineraries`
--
ALTER TABLE `itineraries`
  ADD PRIMARY KEY (`itineraryId`),
  ADD KEY `FK_c932f1f8664e279c46d22aba744` (`userId`);

--
-- Indexes for table `itinerary_destinations`
--
ALTER TABLE `itinerary_destinations`
  ADD PRIMARY KEY (`itineraryDestinationId`),
  ADD UNIQUE KEY `IDX_6c037e3be2431899b9ee020539` (`itineraryId`,`visitOrder`),
  ADD KEY `FK_c0c7d4fe78ad560f79d74334a83` (`destinationId`);

--
-- Indexes for table `tour_guides`
--
ALTER TABLE `tour_guides`
  ADD PRIMARY KEY (`guideId`),
  ADD UNIQUE KEY `IDX_739a7f23b7c86a908329f85836` (`email`),
  ADD KEY `FK_290e0f5cab92fc6d9f4997d4e0c` (`destinationId`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`userId`),
  ADD UNIQUE KEY `IDX_97672ac88f789774dd47f7c8be` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `accommodations`
--
ALTER TABLE `accommodations`
  MODIFY `accommodationId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `destinations`
--
ALTER TABLE `destinations`
  MODIFY `destinationId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `itineraries`
--
ALTER TABLE `itineraries`
  MODIFY `itineraryId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `itinerary_destinations`
--
ALTER TABLE `itinerary_destinations`
  MODIFY `itineraryDestinationId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `tour_guides`
--
ALTER TABLE `tour_guides`
  MODIFY `guideId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `userId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `accommodations`
--
ALTER TABLE `accommodations`
  ADD CONSTRAINT `FK_84a902c3a68feb0880d40dc4bcb` FOREIGN KEY (`destinationId`) REFERENCES `destinations` (`destinationId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `itineraries`
--
ALTER TABLE `itineraries`
  ADD CONSTRAINT `FK_c932f1f8664e279c46d22aba744` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `itinerary_destinations`
--
ALTER TABLE `itinerary_destinations`
  ADD CONSTRAINT `FK_62eb23e0a5c44209a6d0f6dccba` FOREIGN KEY (`itineraryId`) REFERENCES `itineraries` (`itineraryId`) ON DELETE CASCADE ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_c0c7d4fe78ad560f79d74334a83` FOREIGN KEY (`destinationId`) REFERENCES `destinations` (`destinationId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `tour_guides`
--
ALTER TABLE `tour_guides`
  ADD CONSTRAINT `FK_290e0f5cab92fc6d9f4997d4e0c` FOREIGN KEY (`destinationId`) REFERENCES `destinations` (`destinationId`) ON DELETE NO ACTION ON UPDATE NO ACTION;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
